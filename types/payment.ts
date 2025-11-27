// =====================================================
// Payment System Type Definitions
// =====================================================

// =====================================================
// Database Types
// =====================================================

export interface PricingTier {
  id: string;
  name: string;
  display_name: string;
  original_price: number;
  sale_price: number;
  credits: number;
  is_popular: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type PaymentStatus =
  | "pending"
  | "ready"
  | "in_progress"
  | "done"
  | "canceled"
  | "partial_canceled"
  | "aborted"
  | "expired";

export interface Payment {
  id: string;
  user_id: string;
  pricing_tier_id: string | null;
  order_id: string;
  payment_key: string | null;
  amount: number;
  status: PaymentStatus;
  method: string | null;
  card_company: string | null;
  card_number: string | null;
  credits_granted: number;
  failure_code: string | null;
  failure_message: string | null;
  created_at: string;
  approved_at: string | null;
  canceled_at: string | null;
}

export type CreditTransactionType =
  | "purchase"
  | "usage"
  | "admin_grant"
  | "refund"
  | "expiry";

export interface CreditTransaction {
  id: string;
  user_id: string;
  type: CreditTransactionType;
  amount: number;
  balance_after: number;
  payment_id: string | null;
  ad_video_id: string | null;
  granted_by: string | null;
  description: string | null;
  created_at: string;
}

// =====================================================
// TossPayments Types
// =====================================================

export interface TossPaymentConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface TossPaymentConfirmResponse {
  mId: string;
  version: string;
  paymentKey: string;
  status: string;
  lastTransactionKey: string;
  orderId: string;
  orderName: string;
  requestedAt: string;
  approvedAt: string;
  useEscrow: boolean;
  cultureExpense: boolean;
  card?: {
    issuerCode: string;
    acquirerCode: string;
    number: string;
    installmentPlanMonths: number;
    isInterestFree: boolean;
    interestPayer: string | null;
    approveNo: string;
    useCardPoint: boolean;
    cardType: string;
    ownerType: string;
    acquireStatus: string;
    amount: number;
  };
  virtualAccount?: {
    accountType: string;
    accountNumber: string;
    bankCode: string;
    customerName: string;
    dueDate: string;
    refundStatus: string;
    expired: boolean;
    settlementStatus: string;
    refundReceiveAccount: {
      bankCode: string;
      accountNumber: string;
      holderName: string;
    } | null;
  };
  transfer?: {
    bankCode: string;
    settlementStatus: string;
  };
  mobilePhone?: {
    customerMobilePhone: string;
    settlementStatus: string;
    receiptUrl: string;
  };
  giftCertificate?: {
    approveNo: string;
    settlementStatus: string;
  };
  cashReceipt?: {
    type: string;
    receiptKey: string;
    issueNumber: string;
    receiptUrl: string;
    amount: number;
    taxFreeAmount: number;
  };
  discount?: {
    amount: number;
  };
  cancels?: Array<{
    cancelAmount: number;
    cancelReason: string;
    taxFreeAmount: number;
    taxExemptionAmount: number;
    refundableAmount: number;
    easyPayDiscountAmount: number;
    canceledAt: string;
    transactionKey: string;
    receiptKey: string | null;
  }>;
  secret: string | null;
  type: string;
  easyPay?: {
    provider: string;
    amount: number;
    discountAmount: number;
  };
  country: string;
  failure?: {
    code: string;
    message: string;
  };
  isPartialCancelable: boolean;
  receipt?: {
    url: string;
  };
  checkout?: {
    url: string;
  };
  currency: string;
  totalAmount: number;
  balanceAmount: number;
  suppliedAmount: number;
  vat: number;
  taxFreeAmount: number;
  taxExemptionAmount: number;
  method: string;
}

export interface TossPaymentError {
  code: string;
  message: string;
}

// =====================================================
// Action Types
// =====================================================

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

export interface ConfirmPaymentResult {
  success: boolean;
  paymentId?: string;
  creditsGranted?: number;
  error?: string;
}

export interface CancelPaymentResult {
  success: boolean;
  error?: string;
}

// =====================================================
// Component Props Types
// =====================================================

export interface PaymentWidgetProps {
  orderId: string;
  orderName: string;
  amount: number;
  customerKey: string;
  pricingTierId: string;
}

export interface PricingCardProps {
  tier: PricingTier;
  onSelect: (tier: PricingTier) => void;
  isSelected?: boolean;
}

export interface PaymentResultProps {
  success: boolean;
  orderId?: string;
  amount?: number;
  creditsGranted?: number;
  errorMessage?: string;
}
