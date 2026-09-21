export type LoanStatus =
  | 'PAYMENT_FAILED'
  | 'UNDER_REVIEW_CA'
  | 'WAITING_SPV_APPROVAL'
  | 'OFFERING_CUSTOMER'
  | 'READY_FOR_DISBURSEMENT'
  | 'DISBURSED'
  | 'REJECTED_CA'
  | 'REJECTED_SPV';

export type ReviewLayer =
  | 'LAYER_1_CA'
  | 'LAYER_2_SPV'
  | 'CUSTOMER_OFFERING'
  | 'DISBURSEMENT';

export type UserRoleView =
  | 'CREDIT_ANALYST'
  | 'CREDIT_SUPERVISOR'
  | 'DISBURSEMENT_OPS';

export interface LoanReviewLogItem {
  id: string;
  loanId: string;
  operatorName: string;
  operatorRole: string;
  action: string;
  amountBefore: number | null;
  amountAfter: number | null;
  notes: string | null;
  createdAt: string;
}

export interface LoanApplicationItem {
  id: string;
  orderNo: string;
  applicantName: string;
  idNo: string;
  phone: string;
  accountNo: string;
  bankName: string;
  loanType: string;
  requestedAmount: number;
  approvedAmount: number | null;
  tenorMonth: number;
  approvedTenor: number | null;
  interestRate: number;
  monthlyIncome: number;
  dsrRatio: number;
  creditScore: number;
  slikStatus: string;
  status: LoanStatus;
  currentLayer: ReviewLayer;
  caNotes: string | null;
  spvNotes: string | null;
  rejectionReason: string | null;

  // Extended debtor profile
  companyName: string | null;
  jobType: string | null;
  streetAddress: string | null;
  city: string | null;
  province: string | null;

  // Emergency contact
  emergencyName: string | null;
  emergencyRelation: string | null;
  emergencyPhone: string | null;

  // Device & biometric
  deviceModel: string | null;
  faceScore: string | null;

  // CA telephone verification
  teleVerify: string | null;
  callRelat: string | null;

  // IBSCore Core Banking fields
  cif: string | null;
  motherName: string | null;
  birthPlace: string | null;
  birthDate: string | null;
  loanAccountNo: string | null;
  spkNo: string | null;
  branchCode: string | null;
  productCode: string | null;
  creditType: string | null;
  disbursementReceiptNo: string | null;
  disbursementTxType: string | null;

  createdAt: string;
  updatedAt: string;
  reviewLogs: LoanReviewLogItem[];
}

