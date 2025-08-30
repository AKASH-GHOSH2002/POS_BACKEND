const PDFDocument = require('pdfkit');
import { format } from 'date-fns';
import * as bwipjs from 'bwip-js';


function transformBill(flatBill: any) {
  return {
    id: flatBill.bill_id,
    billNumber: flatBill.bill_billNumber,
    subtotal: parseFloat(flatBill.bill_subtotal),
    discountAmount: parseFloat(flatBill.bill_discountAmount),
    total: parseFloat(flatBill.bill_total),
    paidAmount: parseFloat(flatBill.bill_paidAmount),
    paymentMethod: flatBill.bill_paymentMethod,
    createdAt: flatBill.bill_createdAt,
    staffId: flatBill.bill_staffId,
     staff_name: flatBill.staff_name,
    store: {
      id: flatBill.store_id,
      name: flatBill.store_name,
      address: flatBill.store_address,
      phone: flatBill.store_phone,
    },
    customer: {
      id: flatBill.customer_id,
      name: flatBill.customer_name,
      phone: flatBill.customer_phone,
      address: flatBill.customer_address,
    },
    items: [
      {
        id: flatBill.items_id,
        quantity: flatBill.items_quantity,
        unitPrice: parseFloat(flatBill.items_unitPrice),
        total: parseFloat(flatBill.items_total),
        product: {
          id: flatBill.product_id,
          name: flatBill.product_name,
        },
      },
    ],
    taxes: [
      {
        id: flatBill.taxes_id,
        taxName: flatBill.taxes_taxName,
        taxPercent: parseFloat(flatBill.taxes_taxPercent),
        taxAmount: parseFloat(flatBill.taxes_taxAmount),
      },
    ],
  };
}

// Generate PDF
export function generateInvoice(flatBill: any): Promise<Buffer> {
  const bill = transformBill(flatBill);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [226, 800],
      margins: { top: 8, left: 8, right: 8, bottom: 8 },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const width = 210;
    const leftMargin = 8;

    const monoText = (text: string, x: number, y?: number, options?: any) => {
      return doc.font('Courier').text(text, x, y, options);
    };

    const dashedLine = () => {
      const dashes = '-'.repeat(40);
      monoText(dashes, leftMargin, undefined, { align: 'center' });
    };

    const summaryLine = (label: string, value: string, width = 40) => {
      const left = label.padEnd(width - value.length, ' ');
      return left + value;
    };

    // -------- HEADER --------
    doc.font('Courier-Bold').fontSize(12);
    doc.text(bill.store?.name || 'STORE NAME', leftMargin, undefined, {
      align: 'center',
      width,
    });

    doc.font('Courier').fontSize(8);
    if (bill.store?.address)
      doc.text(bill.store.address, leftMargin, undefined, {
        align: 'center',
        width,
      });
    if (bill.store?.phone)
      doc.text(`Tel: ${bill.store.phone}`, leftMargin, undefined, {
        align: 'center',
        width,
      });

    doc.moveDown(0.3);
    dashedLine();

    // -------- INVOICE META --------
    doc.font('Courier-Bold').fontSize(8);
    monoText(`Invoice: ${bill.billNumber}`, leftMargin);
    doc.font('Courier').fontSize(8);
    monoText(
      `Date: ${format(new Date(bill.createdAt), 'dd/MM/yyyy HH:mm')}`,
      leftMargin,
    );
   monoText(`Cashier: ${bill.staff_name || 'Staff'}`, leftMargin);

    doc.moveDown(0.3);
    dashedLine();

    // -------- CUSTOMER INFO --------
    doc.font('Courier-Bold').fontSize(8);
    monoText(
      `Customer: ${bill.customer?.name }`,
      leftMargin,
    );
    doc.font('Courier').fontSize(8);
    if (bill.customer?.phone)
      monoText(`Phone: ${bill.customer.phone}`, leftMargin);
    if (bill.customer?.address)
      monoText(`Address: ${bill.customer.address}`, leftMargin);

    doc.moveDown(0.3);
    dashedLine();

    // -------- ITEMS --------
    doc.font('Courier-Bold').fontSize(8);

    const slHeader = 'SL'.padEnd(3);
    const itemHeader = 'Item'.padEnd(14);
    const qtyHeader = 'Qty'.padStart(5);
    const priceHeader = 'Price'.padStart(9);
    const amountHeader = 'Amount'.padStart(9);

    monoText(
      `${slHeader}${itemHeader}${qtyHeader}${priceHeader}${amountHeader}`,
      leftMargin,
    );

    dashedLine();

    bill.items.forEach((item, index) => {
      const sl = (index + 1).toString().padEnd(3);
      const name = item.product.name.slice(0, 14).padEnd(14);
      const qty = item.quantity.toString().padStart(5);
      const price = (+item.unitPrice).toFixed(2).padStart(9);
      const amount = (+item.total).toFixed(2).padStart(9);

      monoText(`${sl}${name}${qty}${price}${amount}`, leftMargin);
    });

    doc.moveDown(0.3);
    dashedLine();

    // -------- SUMMARY --------
    doc.font('Courier').fontSize(8);
    monoText(summaryLine('Subtotal:', (+bill.subtotal).toFixed(2)), leftMargin);

    if (bill.discountAmount && +bill.discountAmount > 0) {
      monoText(
        summaryLine('Discount:', `-${(+bill.discountAmount).toFixed(2)}`),
        leftMargin,
      );
    }

    if (bill.taxes?.length) {
      bill.taxes.forEach((tax) => {
        const taxLabel = `${tax.taxName} (${tax.taxPercent}%)`;
        monoText(
          summaryLine(taxLabel + ':', (+tax.taxAmount).toFixed(2)),
          leftMargin,
        );
      });
    }

    const totalLine = (label: string, value: string) => {
      const width = 32;
      const left = label.padEnd(width - value.length, ' ');
      return left + value;
    };

    dashedLine();
    doc.font('Courier-Bold').fontSize(9);
    monoText(totalLine('TOTAL:', (+bill.total).toFixed(2)), leftMargin);
    dashedLine();
    doc.font('Courier').fontSize(8);

    if (+bill.paidAmount > 0) {
      monoText(
        summaryLine(
          `Paid (${bill.paymentMethod}):`,
          (+bill.paidAmount).toFixed(2),
        ),
        leftMargin,
      );
    }

    const balance = +bill.total - +bill.paidAmount;
    if (balance > 0) {
      monoText(summaryLine('Due:', balance.toFixed(2)), leftMargin);
    } else if (balance < 0) {
      monoText(
        summaryLine('Change:', Math.abs(balance).toFixed(2)),
        leftMargin,
      );
    }

    doc.moveDown(0.3);
    dashedLine();

    const billId = bill.billNumber || bill.id;

    bwipjs.toBuffer(
      {
        bcid: 'code128',
        text: billId,
        scale: 2,
        height: 10,
        includetext: false,
        textxalign: 'center',
      },
      (err, png) => {
        if (!err) {
          const barcodeWidth = 150;
          const x = (doc.page.width - barcodeWidth) / 2;

          // Draw the barcode
          doc.image(png, x, doc.y + 5, {
            width: barcodeWidth,
            align: 'center',
          });

          // Move the cursor below the barcode
          doc.moveDown(5); // increase this if needed to give more space
        } else {
          // If error, just leave some space
          doc.moveDown(5);
        }

        // -------- FOOTER --------
        const footerY = doc.y; // current cursor after barcode
        doc.font('Courier').fontSize(8);
        doc.text('Thank you for shopping!', 0, footerY, {
          align: 'center',
          width: doc.page.width,
        });
        doc.text('Visit Again!', 0, doc.y + 2, {
          align: 'center',
          width: doc.page.width,
        });

        doc.end();
      },
    );
  });
}
