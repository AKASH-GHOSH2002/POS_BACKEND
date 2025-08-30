import { createCanvas } from 'canvas';
import * as JsBarcode from 'jsbarcode';

export class BarcodePrinter {
  static generateBarcodeImage(code: string, options?: any): Buffer {
    const canvas = createCanvas(200, 100);

    JsBarcode(canvas, code, {
      format: 'CODE128',
      width: 2,
      height: 60,
      displayValue: true,
      fontSize: 12,
      textMargin: 5,
      ...options,
    });

    return canvas.toBuffer('image/png');
  }

  static generateMultipleBarcodes(codes: string[], quantity = 1): Buffer {
    // A4 dimensions in pixels at 300 DPI
    const a4Width = 2480;
    const a4Height = 3508;

    // Layout specifications
    const columns = 3;
    const rows = 10;
    const margin = 118; // ~10mm
    const barcodeWidth = 531; // ~45mm
    const barcodeHeight = 295; // ~25mm
    const horizontalSpacing = 59; // ~5mm
    const verticalSpacing = 118; // ~10mm

    const canvas = createCanvas(a4Width, a4Height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, a4Width, a4Height);

    let currentIndex = 0;
    const maxBarcodes = columns * rows;

    for (const code of codes) {
      for (let q = 0; q < quantity; q++) {
        if (currentIndex >= maxBarcodes) break;

        const row = Math.floor(currentIndex / columns);
        const col = currentIndex % columns;

        const x = margin + col * (barcodeWidth + horizontalSpacing);
        const y = margin + row * (barcodeHeight + verticalSpacing);

        const barcodeCanvas = createCanvas(barcodeWidth, barcodeHeight);
        JsBarcode(barcodeCanvas, code, {
          format: 'CODE128',
          width: 2,
          height: 180,
          displayValue: true,
          fontSize: 36,
          textMargin: 20,
          margin: 10
        });

        ctx.drawImage(barcodeCanvas, x, y);
        currentIndex++;
      }
      if (currentIndex >= maxBarcodes) break;
    }

    return canvas.toBuffer('image/png');
  }
}
