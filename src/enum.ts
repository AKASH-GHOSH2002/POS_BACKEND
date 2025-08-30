export enum UserRole {
  ADMIN = 'ADMIN',
  SALES_STAFF = 'SALES_STAFF',
  STAFF_MANAGER = 'STAFF_MANAGER',
}
export enum DefaultStatus {
  ACTIVE = 'ACTIVE',
  DEACTIVE = 'DEACTIVE',
  DELETED = 'DELETED',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

export enum PageType {
  TNC = 'TERMS & CONDITIONS',
  PRIVACY_POLICY = 'PRIVACY POLICY',
}

export enum PermissionAction {
  CREATE = 'Create',
  READ = 'Read',
  UPDATE = 'Update',
  DELETE = 'Delete',
}

export enum TaxType {
  INCLUSIVE = 'inclusive',
  EXCLUSIVE = 'exclusive',
}

export enum YesNo {
  YES = 'YES',
  NO = 'NO',
}

export enum MovementType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER',
  RETURN = 'RETURN',
}

export enum PaymentMethod {
  CASH = 'CASH',
  UPI = 'UPI',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  OTHER = 'OTHER',
}

export enum BillStatus {
  PAID = 'PAID',
  DUE = 'DUE',
  HOLD = 'HOLD',
  CANCELLED = 'CANCELLED',
}

export enum LedgerType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}
export enum ReportPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  INACTIVE = 'INACTIVE',
}
export enum ReportType {
  BILLS = 'bills',
  UNPAID_BILLS = 'unpaid-bills',
  CUSTOMER_HISTORY = 'customer-history',
}

export enum NotificationType {
  NEW_PRODUCT = 'new_product',
  BACK_IN_STOCK = 'back_in_stock',
  ACCOUNT = 'account',
  ACCOUNT_STATUS_CHANGE = 'account_status_change',
  SYSTEM = 'system',
  LOW_STOCK = 'low_stock',
  MANUAL = 'manual',
}

export enum LogType {
  LOGIN = 'IN',
  LOGOUT = 'OUT',
}