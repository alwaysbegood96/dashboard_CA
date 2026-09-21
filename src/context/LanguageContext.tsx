'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'zh' | 'id';

export interface Translations {
  common: {
    appName: string;
    systemSubtitle: string;
    subDescription: string;
    loading: string;
    refresh: string;
    save: string;
    cancel: string;
    close: string;
    search: string;
    action: string;
    status: string;
    date: string;
    all: string;
    details: string;
    history: string;
    success: string;
    error: string;
    empty: string;
    required: string;
    notes: string;
    rp: string;
    month: string;
    months: string;
  };
  header: {
    creditApprovalSystem: string;
    dashboardSubtitle: string;
    roleCa: string;
    roleSpv: string;
    roleDisbursement: string;
    permissionMatrix: string;
    dbStatus: string;
    superAdminBadge: string;
    singleAdminNotice: string;
    inviteUserBtn: string;
    logoutBtn: string;
  };
  workflow: {
    dashboardTitle: string;
    dualLayerBadge: string;
    principleTitle: string;
    principleText: string;
    syncing: string;
    syncedAgo: (seconds: number, autoCountdown: number) => string;
    connecting: string;
    syncNow: string;
    syncNowTooltip: string;
    syncSuccess: string;
    syncFailed: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
  };
  metrics: {
    totalApplications: string;
    totalDesc: string;
    canceledDisbursement: string;
    canceledDesc: string;
    caReview: string;
    caDesc: string;
    spvApproval: string;
    spvDesc: string;
    readyDisbursement: string;
    readyDesc: string;
    unit: string;
  };
  table: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    tabAll: (count: number) => string;
    tabCanceled: (count: number) => string;
    tabCa: (count: number) => string;
    tabSpv: (count: number) => string;
    tabCustomer: (count: number) => string;
    tabDisbursement: (count: number) => string;
    tabHistory: (count: number) => string;
    colOrderNo: string;
    colApplicant: string;
    colLoanAmount: string;
    colDsrRisk: string;
    colStatus: string;
    colDate: string;
    colAction: string;
    actionReviewDecide: string;
    actionDetail: string;
    actionHistory: string;
    emptyTitle: string;
    emptyDesc: string;
    statusPaymentFailed: string;
    statusUnderReviewCa: string;
    statusWaitingSpv: string;
    statusOfferingCustomer: string;
    statusReadyDisbursement: string;
    statusDisbursed: string;
    statusRejectedCa: string;
    statusRejectedSpv: string;
  };
  drawer: {
    assessmentTitle: string;
    requestedAmount: string;
    approvedAmount: string;
    requestedLabel: string;
    approvedLabel: string;
    tabProfile: string;
    tabScoring: string;
    tabCaReview: string;
    tabSpvReview: string;
    tabAuditTrail: string;

    // Profile
    secIdentity: string;
    nikLabel: string;
    phoneLabel: string;
    disbursementAccount: string;
    monthlyIncome: string;
    cifStatus: string;
    cifNotRegistered: string;
    motherName: string;
    secJobAddress: string;
    companyName: string;
    jobType: string;
    residentialAddress: string;
    secEmergency: string;
    emergencyName: string;
    emergencyRelation: string;
    emergencyPhone: string;
    secDeviceBiometric: string;
    deviceModel: string;
    faceScore: string;
    secEmployment: string;
    secAddress: string;
    cityLabel: string;
    provinceLabel: string;
    profileIncomplete: string;
    deviceModelLabel: string;
    faceMatchScore: string;
    notAvailable: string;
    deviceModelLabel2: string;

    // Scoring & DSR
    secDsrScoring: string;
    dsrDescription: string;
    calcDsrRatio: string;
    creditScoreLabel: string;
    slikStatusLabel: string;
    riskStatusHealthy: string;
    riskStatusModerate: string;
    riskStatusHigh: string;
    scoringTitle: string;
    saveScoring: string;
    slikKol1: string;
    slikKol2: string;
    slikKol3: string;
    slikKol4: string;
    slikKol5: string;
    slikStatusDesc: string;
    creditScoreDesc: string;
    scoringExcellent: string;
    scoringGood: string;
    scoringFair: string;
    scoringHighRisk: string;
    monthlyIncomeVerified: string;
    nominalLabel: string;
    dsrRatioLabel: string;
    autoCalc: string;
    dsrCalcFormula: string;
    dsrCapacity: string;
    dsrSafeLimit: string;
    dsrWarning: string;
    repaymentObligationTitle: string;
    interestFlatLabel: string;
    monthlyInstallmentLabel: string;
    totalInterestLabel: string;

    // Tele Verification
    secCaVerification: string;
    teleVerifyLabel: string;
    teleVerifyPlaceholder: string;
    callRelatLabel: string;
    callRelatPlaceholder: string;
    teleVerifyResults: string;
    teleVerifyLabel2: string;
    callRelatLabel2: string;
    teleVerifyChecklistTitle: string;

    // CA Review tab
    secCaDecision: string;
    recommendedPlafon: string;
    recommendedTenor: string;
    caReviewNotes: string;
    caNotesPlaceholder: string;
    btnApproveToSpv: string;
    btnRejectCa: string;
    rejectionReasonLabel: string;
    rejectionReasonPlaceholder: string;
    caNotesSectionTitle: string;
    caRecommendationTitle: string;
    creditRecommendationTitle: string;
    caNotesLabel: string;
    monthsLabel: string;
    tenorLabel: string;
    month30Days: string;
    month60Days: string;
    month90Days: string;
    rejectionReasonCa: string;
    rejectionReasonSpv: string;
    rejectionPlaceholder: string;
    returnReasonLabel: string;
    returnPlaceholder: string;
    btnSendToSpv: string;
    btnReject: string;
    btnCancel: string;
    btnConfirmReject: string;
    btnConfirmRejectFinal: string;
    btnConfirmReturn: string;
    btnFinalApprove: string;
    btnReturnToCa2: string;
    rejectedByCa: string;
    rejectedBySpv: string;

    // SPV Review tab
    secSpvDecision: string;
    finalPlafon: string;
    finalTenor: string;
    spvNotesLabel: string;
    spvNotesPlaceholder: string;
    btnReturnToCa: string;
    btnRejectSpv: string;
    btnFinalApproveOffering: string;

    // Offering & Acceptance
    secCustomerOffering: string;
    customerOfferingDesc: string;
    btnSimulateCustomerAcceptance: string;
    waitingCustomerConfirmation: string;
    btnCustomerAccept: string;
    btnCustomerDecline: string;

    // Disbursement
    secDisbursement: string;
    disbursementDesc: string;
    btnExecuteDisbursement: string;
    readyToDisbursed: string;
    processingDisburse: string;
    btnDisburse: string;
    loanDisbursed: string;

    // Repayment schedule card
    repaymentPlanTitle: string;
    badgeDefinitive: string;
    badgeSimulation: string;
    netReceivedAmount: string;
    serviceFee: string;
    interestRatePerMonth: string;
    installment1: string;
    installment23: string;
    toggleSchedule: string;
    colInstallmentNo: string;
    colDueDate: string;
    colPrincipal: string;
    colInterest: string;
    colTotalInstallment: string;

    // Audit Trail
    auditTrailTitle: string;
    noAuditLogs: string;
    auditTitle: string;
    noAuditLog: string;

    // Repayment Card additions
    netDisbursedNote: string;
    totalRepaymentLabel: string;
    loanInterestLabel: string;
    firstInstallmentLabel: string;
    principalPlusInterest: string;
    upfrontFeeSuffix: string;
    repaymentRoundingNote: string;
    scheduleDueDetail: string;
    hideSchedule: string;
    viewScheduleDetail: string;
    installmentLabel: string;
    dueDateLabel: string;
    includedPrincipal: string;
    includedInterest: string;

    // Toast & Alerts in Drawer
    toastScoringSaved: string;
    toastScoringSaveFailed: string;
    toastCaSentToSpv: string;
    toastCaSaveFailed: string;
    toastCaRejected: string;
    toastSpvApproved: string;
    toastSpvReturned: string;
    toastSpvRejected: string;
    toastCustomerAccepted: string;
    toastCustomerDeclined: string;
    toastDisbursedSuccess: string;
    alertRejectReasonReq: string;
    alertReturnReasonReq: string;
    alertSpvRejectReasonReq: string;

    // Additional Drawer translations
    slikManualNoticeTitle: string;
    slikManualNoticeDesc: string;
    perMonthSuffix: string;
    spvNotesOptionalLabel: string;
    spvNotesOptionalPlaceholder: string;
    offeringLetterSentDesc: (amount: string) => string;
    netDisbursedCustomerLabel: string;
    recipientAccountLabel: string;
    coreBankingParamsTitle: string;
    branchCodeLabel: string;
    productCodeLabel: string;
    realizationTypeLabel: string;
    spkNoLabel: string;
    disbursedSuccessDesc: string;
    ibscoreProofTitle: string;
    loanAccountNoLabel: string;
    receiptNoLabel: string;
    auditActions: Record<string, string>;
    auditRoles: Record<string, string>;
  };
  login: {
    title: string;
    subtitle: string;
    emailLabel: string;
    passwordLabel: string;
    signingIn: string;
    signInBtn: string;
    demoHint: string;
  };
  footer: {
    copyright: string;
  };
}

export const dictionaries: Record<Language, Translations> = {
  en: {
    common: {
      appName: 'Bank Sentosa',
      systemSubtitle: 'Credit Approval System',
      subDescription: 'Loan Origination & Multi-Layer Assessment Dashboard',
      loading: 'Loading...',
      refresh: 'Refresh',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      search: 'Search',
      action: 'Action',
      status: 'Status',
      date: 'Date',
      all: 'All',
      details: 'Details',
      history: 'History',
      success: 'Success',
      error: 'Error',
      empty: 'No data available',
      required: 'Required',
      notes: 'Notes',
      rp: 'Rp',
      month: 'month',
      months: 'months',
    },
    header: {
      creditApprovalSystem: 'Credit Approval System',
      dashboardSubtitle: 'Loan Origination & Multi-Layer Assessment Dashboard',
      roleCa: 'Credit Analyst (Layer 1)',
      roleSpv: 'Supervisor (Layer 2)',
      roleDisbursement: 'Disbursement Ops',
      permissionMatrix: 'Permission Matrix',
      dbStatus: 'PostgreSQL: ca-dashboard',
      superAdminBadge: 'SUPER_ADMIN • ALL ACCESS',
      singleAdminNotice: 'You are logged in as Super Admin. Use the button below to invite team members via SMTP.',
      inviteUserBtn: 'Invite New User (SMTP)',
      logoutBtn: 'Sign Out (Logout)',
    },
    workflow: {
      dashboardTitle: 'Credit Approval Dashboard',
      dualLayerBadge: 'Dual-Layer Approval',
      principleTitle: 'Operating Principle',
      principleText:
        "Application is customer's request, approval is the bank's decision. Independent credit analysis determines the approved limit, followed by supervisor sign-off, customer acceptance, and disbursement.",
      syncing: 'Syncing...',
      syncedAgo: (s, c) => `Synced ${s}s ago · auto ${c}s`,
      connecting: 'Connecting...',
      syncNow: 'Sync Now',
      syncNowTooltip: 'Manual sync from dev MySQL server via SSH Tunnel',
      syncSuccess: 'Dev data synchronized successfully.',
      syncFailed: 'Failed to synchronize from dev server.',
      step1Title: 'Credit Analyst Review',
      step1Desc: 'DSR Evaluation & Limit Recommendation',
      step2Title: 'Supervisor Final Approval',
      step2Desc: 'Approved Limit Authorization',
      step3Title: 'Offering & Acceptance',
      step3Desc: 'Contract Acceptance by Borrower',
      step4Title: 'Disbursement Ops',
      step4Desc: 'Transfer to USSI Core Banking',
    },
    metrics: {
      totalApplications: 'Total Applications',
      totalDesc: 'All submitted applications',
      canceledDisbursement: 'Canceled / Failed',
      canceledDesc: 'Canceled in Colony lending queue',
      caReview: 'CA Review (Layer 1)',
      caDesc: 'Awaiting credit analysis',
      spvApproval: 'Spv Approval (Layer 2)',
      spvDesc: 'Awaiting supervisor decision',
      readyDisbursement: 'Ready for Disbursement',
      readyDesc: 'Customer accepted offer',
      unit: 'loans',
    },
    table: {
      title: 'Loan Applications List',
      subtitle: 'Manage credit assessment queues and loan decisions',
      searchPlaceholder: 'Search name, ID (NIK), order number...',
      tabAll: (c) => `All (${c})`,
      tabCanceled: (c) => `Canceled (${c})`,
      tabCa: (c) => `Review CA (${c})`,
      tabSpv: (c) => `Approval Spv (${c})`,
      tabCustomer: (c) => `Awaiting Customer (${c})`,
      tabDisbursement: (c) => `Ready Disburse (${c})`,
      tabHistory: (c) => `History (${c})`,
      colOrderNo: 'Order No.',
      colApplicant: 'Applicant',
      colLoanAmount: 'Loan Amount',
      colDsrRisk: 'DSR & Risk Score',
      colStatus: 'Current Status',
      colDate: 'Application Date',
      colAction: 'Action',
      actionReviewDecide: 'Review & Decide',
      actionDetail: 'View Details',
      actionHistory: 'View History',
      emptyTitle: 'No loan applications found',
      emptyDesc: 'Try adjusting your search keyword or selected tab filter.',
      statusPaymentFailed: 'Canceled Disbursement',
      statusUnderReviewCa: 'CA Review (Layer 1)',
      statusWaitingSpv: 'Spv Approval (Layer 2)',
      statusOfferingCustomer: 'Offering to Customer',
      statusReadyDisbursement: 'Ready for Disbursement',
      statusDisbursed: 'Disbursed',
      statusRejectedCa: 'Rejected by CA',
      statusRejectedSpv: 'Rejected by Spv',
    },
    drawer: {
      assessmentTitle: 'Loan Assessment & Decision',
      requestedAmount: 'Requested Amount',
      approvedAmount: 'Approved Amount',
      requestedLabel: 'Requested Plafon',
      approvedLabel: 'Approved Plafon',
      tabProfile: 'Profile',
      tabScoring: 'Scoring',
      tabCaReview: 'CA Review',
      tabSpvReview: 'Spv Approval',
      tabAuditTrail: 'Audit Trail',
      secIdentity: 'Borrower Identity',
      nikLabel: 'National ID / NIK',
      phoneLabel: 'Phone Number',
      disbursementAccount: 'Disbursement Account',
      monthlyIncome: 'Monthly Income',
      cifStatus: 'Core Banking CIF Status',
      cifNotRegistered: 'Unregistered (Non-CIF)',
      motherName: "Mother's Maiden Name",
      secJobAddress: 'Employment & Residence',
      companyName: 'Company Name',
      jobType: 'Job / Profession',
      residentialAddress: 'Residential Address',
      secEmergency: 'Emergency Contact',
      emergencyName: 'Contact Name',
      emergencyRelation: 'Relationship',
      emergencyPhone: 'Contact Phone',
      secDeviceBiometric: 'Device & Biometrics',
      deviceModel: 'Device Model',
      faceScore: 'Facial Match Score',
      secDsrScoring: 'Debt Service Ratio (DSR) & Credit Scoring',
      dsrDescription:
        'DSR calculates the portion of monthly income allocated to loan repayments. DSR ≤ 30% is considered safe.',
      calcDsrRatio: 'Calculated DSR Ratio',
      creditScoreLabel: 'Internal Credit Score',
      slikStatusLabel: 'SLIK / OJK Credit Registry',
      riskStatusHealthy: 'Healthy Risk (DSR ≤ 30%)',
      riskStatusModerate: 'Moderate Risk (DSR 31% - 40%)',
      riskStatusHigh: 'High Risk (DSR > 40%)',
      secCaVerification: 'Verification Call Notes',
      teleVerifyLabel: 'Debtor Verification Call Notes',
      teleVerifyPlaceholder: 'e.g., Debtor confirmed identity and loan intent via phone...',
      callRelatLabel: 'Emergency Contact Call Notes',
      callRelatPlaceholder: 'e.g., Emergency contact acknowledged debtor without issue...',
      secCaDecision: 'Credit Analyst (Layer 1) Recommendation',
      recommendedPlafon: 'Recommended Approved Amount (Rp)',
      recommendedTenor: 'Recommended Tenor',
      caReviewNotes: 'CA Analysis Notes',
      caNotesPlaceholder: 'Provide justification for amount recommendation, DSR assessment, and risk considerations...',
      btnApproveToSpv: 'Approve & Submit to Supervisor',
      btnRejectCa: 'Reject Loan (CA)',
      rejectionReasonLabel: 'Rejection Reason',
      rejectionReasonPlaceholder: 'State reason for loan rejection...',
      secSpvDecision: 'Supervisor (Layer 2) Final Decision',
      finalPlafon: 'Final Approved Plafon (Rp)',
      finalTenor: 'Final Approved Tenor',
      spvNotesLabel: 'Supervisor Decision Notes',
      spvNotesPlaceholder: 'Notes regarding final approved limit and risk approval committee decision...',
      btnReturnToCa: 'Return to CA for Revision',
      btnRejectSpv: 'Reject Loan (Supervisor)',
      btnFinalApproveOffering: 'Final Approve & Send Offer to Borrower',
      secCustomerOffering: 'Customer Offering & Agreement',
      customerOfferingDesc:
        'The approved limit and tenor have been sent to the borrower. The loan will proceed to disbursement once the borrower signs/accepts the contract in the mobile banking app.',
      btnSimulateCustomerAcceptance: 'Simulate Customer Acceptance (Demo)',
      secDisbursement: 'Disbursement Execution',
      disbursementDesc:
        'The contract has been accepted by the customer. Ready to execute disbursement via USSI Core Banking.',
      btnExecuteDisbursement: 'Execute Disbursement Now',
      repaymentPlanTitle: 'Repayment Schedule & Installment Plan',
      badgeDefinitive: 'Definitive Schedule',
      badgeSimulation: 'Simulation',
      netReceivedAmount: 'Net Amount Received by Borrower',
      serviceFee: 'Service Fee (6% deducted upfront)',
      interestRatePerMonth: 'Interest Rate',
      installment1: 'Installment 1',
      installment23: 'Installments 2 & 3',
      toggleSchedule: 'Schedule Table',
      colInstallmentNo: 'Inst. #',
      colDueDate: 'Due Date',
      colPrincipal: 'Principal',
      colInterest: 'Interest',
      colTotalInstallment: 'Total Installment',
      auditTrailTitle: 'Multi-Layer Decision History',
      noAuditLogs: 'No audit logs recorded for this loan yet.',
      // Extended keys
      secEmployment: 'Employment',
      secAddress: 'Home Address',
      cityLabel: 'City',
      provinceLabel: 'Province',
      profileIncomplete: 'Full debtor profile not yet available.',
      deviceModelLabel: 'Device Model',
      faceMatchScore: 'Face Match Score',
      notAvailable: 'Not available',
      scoringTitle: 'Credit Scoring Input & Adjustment',
      saveScoring: 'Save Scoring Changes',
      slikKol1: 'Kol-1: CURRENT (Collectability 1)',
      slikKol2: 'Kol-2: SPECIAL MENTION (1-90 days overdue)',
      slikKol3: 'Kol-3: SUBSTANDARD (91-120 days overdue)',
      slikKol4: 'Kol-4: DOUBTFUL (121-180 days overdue)',
      slikKol5: 'Kol-5: LOSS (>180 days overdue)',
      slikStatusDesc: 'Result from OJK SLIK / iDeb verification',
      creditScoreDesc: 'Standard banking credit score range: 300 - 850',
      scoringExcellent: 'Excellent',
      scoringGood: 'Good',
      scoringFair: 'Fair',
      scoringHighRisk: 'High Risk',
      monthlyIncomeVerified: 'Verified Monthly Income (Rp)',
      nominalLabel: 'Amount',
      dsrRatioLabel: 'DSR Ratio (%)',
      autoCalc: 'Auto-Calculate',
      dsrCalcFormula: '(Installment / Salary) × 100%',
      dsrCapacity: 'Repayment Capacity (DSR Ratio)',
      dsrSafeLimit: 'Safe Limit Max 40%',
      dsrWarning: 'exceeds 40% — debtor repayment capacity at high risk',
      repaymentObligationTitle: 'Loan Repayment Obligation',
      interestFlatLabel: 'Flat interest',
      monthlyInstallmentLabel: 'Monthly Installment',
      totalInterestLabel: 'Total Interest Cost',
      deviceModelLabel2: 'Device Model',
      teleVerifyResults: 'Phone Verification Results (CA)',
      teleVerifyLabel2: 'Debtor Phone Call',
      callRelatLabel2: 'Emergency Contact Phone Call',
      teleVerifyChecklistTitle: 'Phone Verification Checklist',
      caNotesSectionTitle: 'CA Analysis Notes',
      caRecommendationTitle: 'CA Recommendation',
      creditRecommendationTitle: 'Credit Recommendation',
      caNotesLabel: 'Credit Analysis Notes (CA)',
      monthsLabel: 'Months',
      tenorLabel: 'Tenor (Months)',
      month30Days: 'Month (30 Days)',
      month60Days: 'Months (60 Days)',
      month90Days: 'Months (90 Days)',
      rejectionReasonCa: 'Rejection Reason (Credit Analyst)',
      rejectionReasonSpv: 'Rejection Reason (Supervisor)',
      rejectionPlaceholder: 'State the reason for rejection...',
      returnReasonLabel: 'Return Reason to CA',
      returnPlaceholder: 'State what needs to be clarified by CA...',
      btnSendToSpv: 'Send Recommendation to Supervisor',
      btnReject: 'Reject',
      btnCancel: 'Cancel',
      btnConfirmReject: 'Confirm Reject',
      btnConfirmRejectFinal: 'Confirm Final Reject',
      btnConfirmReturn: 'Confirm Return',
      btnFinalApprove: 'Final Approve & Issue Offering',
      btnReturnToCa2: 'Return to CA',
      rejectedByCa: 'Rejected by Credit Analyst',
      rejectedBySpv: 'Rejected by Supervisor',
      waitingCustomerConfirmation: 'Waiting for Customer Contract Confirmation',
      btnCustomerAccept: 'Simulate: Customer Accepts',
      btnCustomerDecline: 'Simulate: Customer Declines',
      readyToDisbursed: 'All Approvals Complete — Ready to Disburse via IBSCore',
      processingDisburse: 'Processing via IBSCore...',
      btnDisburse: 'Execute Disbursement (Disburse via USSI IBSCore)',
      loanDisbursed: 'Loan Active & Successfully Disbursed',
      auditTitle: 'Approval History & Audit Trail',
      noAuditLog: 'No audit trail recorded for this application.',

      // Repayment Card additions
      netDisbursedNote: '(Net Transfer to Account)',
      totalRepaymentLabel: 'Total Repayment',
      loanInterestLabel: 'Loan Interest',
      firstInstallmentLabel: 'First Installment',
      principalPlusInterest: 'Principal + Interest',
      upfrontFeeSuffix: 'upfront',
      repaymentRoundingNote: 'Fees and interest remain fixed for early repayments. Principal rounding differences are allocated to Installment 1.',
      scheduleDueDetail: 'Due Dates & Installment Breakdown:',
      hideSchedule: 'Hide Schedule',
      viewScheduleDetail: 'View Full Schedule',
      installmentLabel: 'Installment',
      dueDateLabel: 'Due Date',
      includedPrincipal: 'Includes principal',
      includedInterest: 'interest',

      // Toast & Alerts in Drawer
      toastScoringSaved: 'Scoring & SLIK data saved to database!',
      toastScoringSaveFailed: 'Failed to save scoring',
      toastCaSentToSpv: 'CA recommendation & scoring data submitted to Supervisor!',
      toastCaSaveFailed: 'Failed to save',
      toastCaRejected: 'Application rejected by CA.',
      toastSpvApproved: 'Final Approval successful! Offering automatically issued to customer.',
      toastSpvReturned: 'Application returned to Credit Analyst for revision.',
      toastSpvRejected: 'Application rejected by Supervisor.',
      toastCustomerAccepted: 'Customer accepted the offer! Ready for disbursement.',
      toastCustomerDeclined: 'Customer declined the offer.',
      toastDisbursedSuccess: 'Funds disbursed to customer account via Core Banking USSI!',
      alertRejectReasonReq: 'Please enter a rejection reason.',
      alertReturnReasonReq: 'Please state the reason for returning to CA.',
      alertSpvRejectReasonReq: 'Please enter Supervisor rejection reason.',

      // Additional Drawer translations
      slikManualNoticeTitle: 'Manual SLIK / iDeb OJK Integration (Credit Analyst Input)',
      slikManualNoticeDesc: 'As the live OJK SLIK API is not connected, the Credit Analyst (CA) can manually update collectability status, credit score, and income based on verified iDeb results.',
      perMonthSuffix: '/ mo',
      spvNotesOptionalLabel: 'Supervisor Decision Notes (Optional)',
      spvNotesOptionalPlaceholder: 'Add final supervisor approval remarks...',
      offeringLetterSentDesc: (amt) => `Offering letter of ${amt} has been issued. Disbursement will proceed once the customer signs the loan contract.`,
      netDisbursedCustomerLabel: 'Net Disbursed Amount (Received by Customer):',
      recipientAccountLabel: 'Recipient Account:',
      coreBankingParamsTitle: 'Core Banking Parameter Details (IBS):',
      branchCodeLabel: 'Branch Code:',
      productCodeLabel: 'Product Code:',
      realizationTypeLabel: 'Realization Type:',
      spkNoLabel: 'Contract (SPK) No:',
      disbursedSuccessDesc: 'Funds have been successfully credited to customer account. The loan facility is now active in Core Banking Bank Sentosa.',
      ibscoreProofTitle: 'IBSCore Posting Proof:',
      loanAccountNoLabel: 'Loan Account No:',
      receiptNoLabel: 'Transaction Receipt No:',
      auditActions: {
        RECOMMEND_APPROVAL: 'RECOMMEND APPROVAL',
        APPROVE_APPLICATION: 'FINAL APPROVAL',
        REJECT_CA: 'REJECTED (CA)',
        REJECT_SPV: 'REJECTED (SPV)',
        RETURN_TO_CA: 'RETURN TO CA',
        CUSTOMER_ACCEPT: 'CUSTOMER ACCEPTED',
        CUSTOMER_DECLINE: 'CUSTOMER DECLINED',
        DISBURSE_FUNDS: 'DISBURSE FUNDS',
        DISBURSEMENT_SUCCESS: 'DISBURSED SUCCESS',
        DISBURSEMENT_REJECTED: 'DISBURSEMENT CANCELED',
        SUBMIT_APPLICATION: 'APPLICATION SUBMITTED',
      },
      auditRoles: {
        CREDIT_ANALYST: 'Credit Analyst',
        SUPERVISOR: 'Supervisor',
        CREDIT_SUPERVISOR: 'Credit Supervisor',
        CUSTOMER: 'Borrower',
        TREASURY: 'Treasury / Ops',
        DISBURSEMENT_OPS: 'Disbursement Ops',
        SYSTEM: 'System',
        SUPER_ADMIN: 'Super Admin',
      },
    },
    login: {
      title: 'Bank Sentosa',
      subtitle: 'Credit Approval System • Internal Risk Management Portal',
      emailLabel: 'Work Email',
      passwordLabel: 'Password',
      signingIn: 'Signing in...',
      signInBtn: 'Sign In to Portal',
      demoHint: 'Default demo account: jimmy.dolly@banksentosa.co.id',
    },
    footer: {
      copyright:
        'PT BPR Karya Prima Sentosa • Internal Credit Approval Portal • Database PostgreSQL: ca-dashboard',
    },
  },

  zh: {
    common: {
      appName: 'Bank Sentosa 银行',
      systemSubtitle: '信贷审批系统',
      subDescription: '贷款发放与多层风控评估管理平台',
      loading: '加载中...',
      refresh: '刷新',
      save: '保存',
      cancel: '取消',
      close: '关闭',
      search: '搜索',
      action: '操作',
      status: '状态',
      date: '日期',
      all: '全部',
      details: '查看详情',
      history: '历史记录',
      success: '操作成功',
      error: '操作失败',
      empty: '暂无相关数据',
      required: '必填',
      notes: '备注意见',
      rp: 'Rp',
      month: '个月',
      months: '个月',
    },
    header: {
      creditApprovalSystem: '信贷审批系统 (Credit Approval)',
      dashboardSubtitle: '贷款发放与多层风控评估管理平台',
      roleCa: '信贷分析员初审 (Layer 1)',
      roleSpv: '主管终审 (Layer 2)',
      roleDisbursement: '放款运营 (Disbursement)',
      permissionMatrix: '权限矩阵 (RBAC)',
      dbStatus: 'PostgreSQL: ca-dashboard',
      superAdminBadge: '超级管理员 • 全部权限',
      singleAdminNotice: '您当前以超级管理员身份登录。请使用下方按钮通过 SMTP 邀请新团队成员。',
      inviteUserBtn: '邀请新用户 (SMTP)',
      logoutBtn: '退出登录 (Logout)',
    },
    workflow: {
      dashboardTitle: '贷款审批控制台',
      dualLayerBadge: '双重审批机制 (Dual-Layer)',
      principleTitle: '基本原则',
      principleText:
        '贷款申请是客户的请求，而贷款审批是银行的决策。信贷分析员独立评估确定批准额度，随后由主管最终审批、客户确认合同并执行放款。',
      syncing: '正在同步...',
      syncedAgo: (s, c) => `已同步于 ${s}秒前 · 自动同步 ${c}秒`,
      connecting: '连接中...',
      syncNow: '立即同步',
      syncNowTooltip: '通过 SSH 隧道从开发环境 MySQL 服务器手动同步数据',
      syncSuccess: '开发服务器数据同步成功。',
      syncFailed: '从开发服务器同步失败。',
      step1Title: '信贷分析员初审',
      step1Desc: '评估 DSR 还款能力与建议额度',
      step2Title: '主管终审批准',
      step2Desc: '最终授信额度与风险决策',
      step3Title: '合同推送与确认',
      step3Desc: '客户在移动端确认借款协议',
      step4Title: '放款出账 (Disbursement)',
      step4Desc: '转账并同步至 USSI 核心银行',
    },
    metrics: {
      totalApplications: '全部申请总量',
      totalDesc: '所有已提交贷款申请',
      canceledDisbursement: '放款取消 / 失败',
      canceledDesc: '在 Colony 放款队列中取消',
      caReview: '初审待办 (Layer 1)',
      caDesc: '等待信贷分析员评估',
      spvApproval: '主管复审 (Layer 2)',
      spvDesc: '等待主管终审决策',
      readyDisbursement: '待放款出账',
      readyDesc: '客户已确认签约合同',
      unit: '笔',
    },
    table: {
      title: '贷款申请审批列表',
      subtitle: '管理信贷审核队列与授信审批决策',
      searchPlaceholder: '搜索借款人姓名、身份证号(NIK)、订单号...',
      tabAll: (c) => `全部 (${c})`,
      tabCanceled: (c) => `取消/失败 (${c})`,
      tabCa: (c) => `初审待办 (${c})`,
      tabSpv: (c) => `主管复审 (${c})`,
      tabCustomer: (c) => `等待签约 (${c})`,
      tabDisbursement: (c) => `待放款 (${c})`,
      tabHistory: (c) => `历史记录 (${c})`,
      colOrderNo: '订单编号',
      colApplicant: '借款人',
      colLoanAmount: '借款金额',
      colDsrRisk: 'DSR 负债比 & 风险',
      colStatus: '当前状态',
      colDate: '申请时间',
      colAction: '操作',
      actionReviewDecide: '审核与决策',
      actionDetail: '查看详情',
      actionHistory: '查看记录',
      emptyTitle: '未找到符合条件的贷款申请',
      emptyDesc: '请尝试更换搜索关键字或切换标签筛选条件。',
      statusPaymentFailed: '放款取消/失败',
      statusUnderReviewCa: '初审中 (Layer 1)',
      statusWaitingSpv: '主管复审中 (Layer 2)',
      statusOfferingCustomer: '等待客户确认签约',
      statusReadyDisbursement: '待放款出账',
      statusDisbursed: '已放款到账',
      statusRejectedCa: '初审拒绝',
      statusRejectedSpv: '主管拒绝',
    },
    drawer: {
      assessmentTitle: '贷款详情与审批评估',
      requestedAmount: '客户申请金额',
      approvedAmount: '最终批准金额',
      requestedLabel: '申请金额 (Requested)',
      approvedLabel: '批准额度 (Approved)',
      tabProfile: '客户档案',
      tabScoring: '风控评分',
      tabCaReview: '初审评估 (CA)',
      tabSpvReview: '主管审批 (Spv)',
      tabAuditTrail: '审计记录',
      secIdentity: '借款人身份信息',
      nikLabel: '身份证号 / NIK',
      phoneLabel: '手机号码',
      disbursementAccount: '放款收款银行账户',
      monthlyIncome: '月均收入',
      cifStatus: '核心银行 CIF 客户号',
      cifNotRegistered: '未注册 (Non-CIF)',
      motherName: '母亲姓名',
      secJobAddress: '工作与居住信息',
      companyName: '工作单位 / 公司名称',
      jobType: '职业类型',
      residentialAddress: '现居住详细地址',
      secEmergency: '紧急联系人',
      emergencyName: '联系人姓名',
      emergencyRelation: '与借款人关系',
      emergencyPhone: '联系人电话',
      secDeviceBiometric: '设备指纹与人脸核验',
      deviceModel: '申请手机设备型号',
      faceScore: '人脸活体比对分',
      secDsrScoring: '还款能力 (DSR) 与内部信用评分',
      dsrDescription:
        'DSR（债务收入比）衡量借款人每月偿债金额占月收入的比例。DSR ≤ 30% 视为安全健康。',
      calcDsrRatio: '系统测算 DSR 比率',
      creditScoreLabel: '内部信用评分',
      slikStatusLabel: '央行征信 / SLIK 记录',
      riskStatusHealthy: '优质风险 (DSR ≤ 30%)',
      riskStatusModerate: '中等风险 (DSR 31% - 40%)',
      riskStatusHigh: '高风险预警 (DSR > 40%)',
      secCaVerification: '电话核查电销记录',
      teleVerifyLabel: '借款人电话核查记录',
      teleVerifyPlaceholder: '例如：已致电借款人，核实借款意图真实，收入信息一致...',
      callRelatLabel: '紧急联系人核查记录',
      callRelatPlaceholder: '例如：已联系紧急联系人，确认为借款人亲属，无异常...',
      secCaDecision: '信贷分析员 (Layer 1) 审核建议',
      recommendedPlafon: '建议批准金额 (Rp)',
      recommendedTenor: '建议贷款期限',
      caReviewNotes: '初审分析意见',
      caNotesPlaceholder: '请详细阐述额度调整理由、DSR 测算依据及风控结论...',
      btnApproveToSpv: '批准并提交主管终审',
      btnRejectCa: '初审拒绝',
      rejectionReasonLabel: '拒绝原因',
      rejectionReasonPlaceholder: '请输入拒绝该笔申请的详细原因...',
      secSpvDecision: '主管复审 (Layer 2) 最终审批',
      finalPlafon: '最终批准授信额度 (Rp)',
      finalTenor: '最终批准期限',
      spvNotesLabel: '主管终审批示意见',
      spvNotesPlaceholder: '填写主管终审批准意见、风控委员会决议...',
      btnReturnToCa: '退回初审修改 (Return to CA)',
      btnRejectSpv: '终审拒绝 (Reject)',
      btnFinalApproveOffering: '终审批准并向客户发送借款合同',
      secCustomerOffering: '客户借款协议确认',
      customerOfferingDesc:
        '最终批准额度与期限已推送至借款人手机 App。借款人在线签署确认协议后，将直接进入放款队列。',
      btnSimulateCustomerAcceptance: '模拟客户确认签约 (Demo)',
      secDisbursement: '放款出账执行',
      disbursementDesc:
        '客户已完成协议确认。已具备放款条件，可执行向 USSI 核心银行系统出账。',
      btnExecuteDisbursement: '立即执行放款出账',
      repaymentPlanTitle: '还款计划与分期日程',
      badgeDefinitive: '最终执行计划',
      badgeSimulation: '测算模拟',
      netReceivedAmount: '客户实际到账金额',
      serviceFee: '技术服务费 (前期扣除 6%)',
      interestRatePerMonth: '月综合利率',
      installment1: '第 1 期还款',
      installment23: '第 2、3 期还款',
      toggleSchedule: '还款明细表',
      colInstallmentNo: '期数',
      colDueDate: '还款截止日',
      colPrincipal: '应还本金',
      colInterest: '利息',
      colTotalInstallment: '本期应还总额',
      auditTrailTitle: '多级审批审计历史轨迹',
      noAuditLogs: '此申请暂无审批审计日志记录。',
      // Extended keys
      secEmployment: '工作信息',
      secAddress: '居住地址',
      cityLabel: '城市',
      provinceLabel: '省份',
      profileIncomplete: '完整借款人档案暂未录入，请通过编辑功能补充。',
      deviceModelLabel: '申请手机型号',
      faceMatchScore: '人脸活体比对分',
      notAvailable: '暂无数据',
      scoringTitle: '信用评分录入与调整',
      saveScoring: '保存评分更改',
      slikKol1: 'Kol-1: 正常 (LANCAR)',
      slikKol2: 'Kol-2: 需特别关注 (逾期1-90天)',
      slikKol3: 'Kol-3: 次级 (逾期91-120天)',
      slikKol4: 'Kol-4: 可疑 (逾期121-180天)',
      slikKol5: 'Kol-5: 损失 (逾期>180天)',
      slikStatusDesc: 'OJK SLIK / iDeb 征信验证结果',
      creditScoreDesc: '标准银行信用分区间：300 - 850',
      scoringExcellent: '优秀',
      scoringGood: '良好',
      scoringFair: '中等',
      scoringHighRisk: '高风险',
      monthlyIncomeVerified: '已核实月均收入 (Rp)',
      nominalLabel: '金额',
      dsrRatioLabel: 'DSR 负债比率 (%)',
      autoCalc: '自动计算',
      dsrCalcFormula: '（月供 / 月收入）× 100%',
      dsrCapacity: '偿债能力 (DSR 比率)',
      dsrSafeLimit: '安全上限 40%',
      dsrWarning: '超过40%上限 — 借款人偿还能力高风险预警',
      repaymentObligationTitle: '贷款还款义务',
      interestFlatLabel: '固定利率',
      monthlyInstallmentLabel: '每月还款额',
      totalInterestLabel: '利息总额',
      deviceModelLabel2: '设备型号',
      teleVerifyResults: '电话核查记录 (CA)',
      teleVerifyLabel2: '借款人电话',
      callRelatLabel2: '紧急联系人电话',
      teleVerifyChecklistTitle: '电话核查清单',
      caNotesSectionTitle: '初审分析意见',
      caRecommendationTitle: '信贷分析员建议',
      creditRecommendationTitle: '授信建议',
      caNotesLabel: '信贷分析意见 (CA备注)',
      monthsLabel: '个月',
      tenorLabel: '贷款期限 (月)',
      month30Days: '个月 (30天)',
      month60Days: '个月 (60天)',
      month90Days: '个月 (90天)',
      rejectionReasonCa: '拒绝原因 (信贷分析员)',
      rejectionReasonSpv: '拒绝原因 (主管)',
      rejectionPlaceholder: '请填写拒绝该申请的详细原因...',
      returnReasonLabel: '退回初审原因',
      returnPlaceholder: '请说明需要CA重新核实的具体内容...',
      btnSendToSpv: '提交至主管终审',
      btnReject: '拒绝',
      btnCancel: '取消',
      btnConfirmReject: '确认拒绝',
      btnConfirmRejectFinal: '确认最终拒绝',
      btnConfirmReturn: '确认退回',
      btnFinalApprove: '终审批准并发放借款合同',
      btnReturnToCa2: '退回初审',
      rejectedByCa: '已被信贷分析员拒绝',
      rejectedBySpv: '已被主管拒绝',
      waitingCustomerConfirmation: '等待客户确认签署借款协议',
      btnCustomerAccept: '模拟：客户同意',
      btnCustomerDecline: '模拟：客户取消',
      readyToDisbursed: '审批完成 — 可执行放款出账至 IBSCore',
      processingDisburse: '正在处理出账至 IBSCore...',
      btnDisburse: '立即执行放款 (Disburse via USSI IBSCore)',
      loanDisbursed: '贷款已激活并成功放款到账',
      auditTitle: '多级审批历史与审计轨迹',
      noAuditLog: '此申请暂无审计记录。',

      // Repayment Card additions
      netDisbursedNote: '(实际转账至借款人账户)',
      totalRepaymentLabel: '还款总额',
      loanInterestLabel: '借款利息',
      firstInstallmentLabel: '首期还款',
      principalPlusInterest: '本金 + 利息',
      upfrontFeeSuffix: '前期扣除',
      repaymentRoundingNote: '费用与利息按标准固定扣除。本金计算尾数差额分配在第 1 期。',
      scheduleDueDetail: '还款日及分期金额明细：',
      hideSchedule: '收起明细',
      viewScheduleDetail: '查看完整计划',
      installmentLabel: '第',
      dueDateLabel: '到期日',
      includedPrincipal: '含本金',
      includedInterest: '借款利息',

      // Toast & Alerts in Drawer
      toastScoringSaved: '风控评分与征信数据已保存至数据库！',
      toastScoringSaveFailed: '保存评分数据失败',
      toastCaSentToSpv: '初审建议与风控数据已成功提交至主管！',
      toastCaSaveFailed: '保存失败',
      toastCaRejected: '借款申请已被初审信贷员拒绝。',
      toastSpvApproved: '主管终审批准成功！借款合同协议已推送至客户。',
      toastSpvReturned: '申请已退回初审信贷员重新核实。',
      toastSpvRejected: '申请已被主管拒绝。',
      toastCustomerAccepted: '客户已签署确认借款协议！具备放款条件。',
      toastCustomerDeclined: '客户已放弃/拒绝借款协议。',
      toastDisbursedSuccess: '资金已通过 USSI 核心银行系统成功出账放款！',
      alertRejectReasonReq: '请输入拒绝原因。',
      alertReturnReasonReq: '请填写退回初审修改的原因。',
      alertSpvRejectReasonReq: '请输入主管拒绝原因。',

      // Additional Drawer translations
      slikManualNoticeTitle: '央行征信 SLIK / iDeb 人工录入核验（信贷分析员专用）',
      slikManualNoticeDesc: '由于 OJK SLIK 征信系统尚未接入实时 API，信贷分析员（CA）可根据 iDeb 纸质/电子征信核查结果，手动录入五级分类征信状态、内部评分及月收入。',
      perMonthSuffix: '/ 月',
      spvNotesOptionalLabel: '主管终审批注意见（选填）',
      spvNotesOptionalPlaceholder: '填写主管终审批准意见或风控批示...',
      offeringLetterSentDesc: (amt) => `批准额度为 ${amt} 的借款合同协议已推送到借款人手机端。借款人在线签署确认协议后，系统将自动进入放款出账流程。`,
      netDisbursedCustomerLabel: '实际到账净额（客户实收）：',
      recipientAccountLabel: '放款收款账户：',
      coreBankingParamsTitle: '核心银行出账参数明细 (USSI IBSCore)：',
      branchCodeLabel: '经办机构代码：',
      productCodeLabel: '信贷产品代码：',
      realizationTypeLabel: '放款出账类型：',
      spkNoLabel: '借款合同编号 (SPK)：',
      disbursedSuccessDesc: '贷款资金已成功过账至借款人银行账户。信贷台账已在 Bank Sentosa 核心银行系统中正式建档激活。',
      ibscoreProofTitle: 'IBSCore 核心入账凭证：',
      loanAccountNoLabel: '贷款合同账号：',
      receiptNoLabel: '交易流水收据号：',
      auditActions: {
        RECOMMEND_APPROVAL: '初审建议批准',
        APPROVE_APPLICATION: '主管终审批准',
        REJECT_CA: '初审拒绝',
        REJECT_SPV: '主管终审拒绝',
        RETURN_TO_CA: '退回初审修改',
        CUSTOMER_ACCEPT: '客户确认签约',
        CUSTOMER_DECLINE: '客户放弃借款',
        DISBURSE_FUNDS: '执行放款出账',
        DISBURSEMENT_SUCCESS: '放款出账成功',
        DISBURSEMENT_REJECTED: '放款取消作废',
        SUBMIT_APPLICATION: '提交借款申请',
      },
      auditRoles: {
        CREDIT_ANALYST: '信贷分析员',
        SUPERVISOR: '风控主管',
        CREDIT_SUPERVISOR: '风控主管',
        CUSTOMER: '借款客户',
        TREASURY: '资金清算岗',
        DISBURSEMENT_OPS: '放款运营岗',
        SYSTEM: '风控系统自动',
        SUPER_ADMIN: '超级管理员',
      },
    },
    login: {
      title: 'Bank Sentosa 银行',
      subtitle: '信贷审批系统 • 内部风险管理控制台',
      emailLabel: '企业工作邮箱',
      passwordLabel: '登录密码',
      signingIn: '正在登录...',
      signInBtn: '登录管理后台',
      demoHint: '测试演示账号：jimmy.dolly@banksentosa.co.id',
    },
    footer: {
      copyright:
        'PT BPR Karya Prima Sentosa • 内部信贷审批系统 • PostgreSQL 数据库: ca-dashboard',
    },
  },

  id: {
    common: {
      appName: 'Bank Sentosa',
      systemSubtitle: 'Credit Approval System',
      subDescription: 'Loan Origination & Multi-Layer Assessment Dashboard',
      loading: 'Memuat...',
      refresh: 'Refresh',
      save: 'Simpan',
      cancel: 'Batal',
      close: 'Tutup',
      search: 'Cari',
      action: 'Aksi',
      status: 'Status',
      date: 'Tanggal',
      all: 'Semua',
      details: 'Detail',
      history: 'Riwayat',
      success: 'Berhasil',
      error: 'Gagal',
      empty: 'Tidak ada data',
      required: 'Wajib',
      notes: 'Catatan',
      rp: 'Rp',
      month: 'bulan',
      months: 'bulan',
    },
    header: {
      creditApprovalSystem: 'Credit Approval System',
      dashboardSubtitle: 'Loan Origination & Multi-Layer Assessment Dashboard',
      roleCa: 'Credit Analyst (Layer 1)',
      roleSpv: 'Admin / Spv (Layer 2)',
      roleDisbursement: 'Disbursement Ops',
      permissionMatrix: 'Permission Matrix',
      dbStatus: 'PostgreSQL: ca-dashboard',
      superAdminBadge: 'SUPER_ADMIN • ALL ACCESS',
      singleAdminNotice:
        'Anda login sebagai Super Admin tunggal. Gunakan tombol di bawah untuk mengundang anggota tim baru via email SMTP.',
      inviteUserBtn: 'Undang User Baru (SMTP)',
      logoutBtn: 'Keluar (Logout)',
    },
    workflow: {
      dashboardTitle: 'Dashboard Persetujuan Pinjaman',
      dualLayerBadge: 'Dual-Layer Approval',
      principleTitle: 'Prinsip Operasional',
      principleText:
        'Pengajuan adalah permohonan nasabah, persetujuan adalah keputusan bank. Analisis kelayakan kredit independen menentukan batas pinjaman yang disetujui, dilanjutkan persetujuan supervisor, konfirmasi nasabah, dan pencairan.',
      syncing: 'Menyinkronkan...',
      syncedAgo: (s, c) => `Sync ${s}d lalu · auto ${c}d`,
      connecting: 'Menghubungkan...',
      syncNow: 'Sync Sekarang',
      syncNowTooltip: 'Sync manual sekarang dari MySQL server dev via SSH Tunnel',
      syncSuccess: 'Sinkronisasi dari dev server berhasil.',
      syncFailed: 'Gagal sinkronisasi dari dev server.',
      step1Title: 'Credit Analyst Review',
      step1Desc: 'Cek DSR & Rekomendasi Nilai',
      step2Title: 'Supervisor Final Approval',
      step2Desc: 'Persetujuan Limit Plafon',
      step3Title: 'Offering & Konfirmasi',
      step3Desc: 'Persetujuan Akad oleh Nasabah',
      step4Title: 'Pencairan (Disbursement)',
      step4Desc: 'Transfer ke USSI Core Banking',
    },
    metrics: {
      totalApplications: 'Total Pengajuan',
      totalDesc: 'Semua berkas masuk',
      canceledDisbursement: 'Batal Pencairan',
      canceledDesc: 'Dibatalkan di antrean lending Colony',
      caReview: 'Review CA (Layer 1)',
      caDesc: 'Butuh analisis kredit',
      spvApproval: 'Approval Spv (Layer 2)',
      spvDesc: 'Menunggu keputusan akhir',
      readyDisbursement: 'Siap Dicairkan',
      readyDesc: 'Akad nasabah disetujui',
      unit: 'berkas',
    },
    table: {
      title: 'Daftar Pengajuan Kredit Pinjaman',
      subtitle: 'Kelola antrean dan keputusan kelayakan kredit nasabah',
      searchPlaceholder: 'Cari nama, NIK, no order...',
      tabAll: (c) => `Semua (${c})`,
      tabCanceled: (c) => `Batal Pencairan (${c})`,
      tabCa: (c) => `Review CA (${c})`,
      tabSpv: (c) => `Approval Spv (${c})`,
      tabCustomer: (c) => `Menunggu Akad (${c})`,
      tabDisbursement: (c) => `Siap Pencairan (${c})`,
      tabHistory: (c) => `Riwayat Selesai (${c})`,
      colOrderNo: 'No. Order',
      colApplicant: 'Pemohon',
      colLoanAmount: 'Nilai Pinjaman',
      colDsrRisk: 'DSR & Risiko',
      colStatus: 'Status Saat Ini',
      colDate: 'Tanggal Masuk',
      colAction: 'Aksi',
      actionReviewDecide: 'Review & Putuskan',
      actionDetail: 'Detail',
      actionHistory: 'Riwayat Berkas',
      emptyTitle: 'Tidak ada pengajuan pinjaman',
      emptyDesc: 'Coba ubah kata kunci pencarian atau tab filter yang dipilih.',
      statusPaymentFailed: 'Batal Pencairan',
      statusUnderReviewCa: 'Review CA (Layer 1)',
      statusWaitingSpv: 'Approval Spv (Layer 2)',
      statusOfferingCustomer: 'Menunggu Nasabah',
      statusReadyDisbursement: 'Siap Pencairan',
      statusDisbursed: 'Dicairkan',
      statusRejectedCa: 'Ditolak CA',
      statusRejectedSpv: 'Ditolak SPV',
    },
    drawer: {
      assessmentTitle: 'Detail & Evaluasi Pinjaman',
      requestedAmount: 'Plafon Diajukan',
      approvedAmount: 'Plafon Disetujui',
      requestedLabel: 'Plafon Diajukan',
      approvedLabel: 'Plafon Disetujui',
      tabProfile: 'Profil',
      tabScoring: 'Scoring',
      tabCaReview: 'Review CA',
      tabSpvReview: 'Spv Approval',
      tabAuditTrail: 'Audit Trail',
      secIdentity: 'Identitas Debitur',
      nikLabel: 'NIK / No. KTP',
      phoneLabel: 'Nomor HP',
      disbursementAccount: 'Rekening Pencairan',
      monthlyIncome: 'Pendapatan Bulanan',
      cifStatus: 'Status CIF (Core Banking)',
      cifNotRegistered: 'Belum Terdaftar (Non-CIF)',
      motherName: 'Nama Ibu Kandung',
      secJobAddress: 'Pekerjaan & Alamat Domisili',
      companyName: 'Nama Perusahaan / Tempat Kerja',
      jobType: 'Bidang Pekerjaan',
      residentialAddress: 'Alamat Tinggal Lengkap',
      secEmergency: 'Kontak Darurat',
      emergencyName: 'Nama Kontak Darurat',
      emergencyRelation: 'Hubungan Keluarga',
      emergencyPhone: 'Nomor Telepon Darurat',
      secDeviceBiometric: 'Informasi Perangkat & Biometrik',
      deviceModel: 'Model Smartphone',
      faceScore: 'Skor Pengenalan Wajah',
      secDsrScoring: 'Debt Service Ratio (DSR) & Credit Scoring',
      dsrDescription:
        'DSR menghitung porsi cicilan terhadap pendapatan bulanan. DSR ≤ 30% dikategorikan Sehat.',
      calcDsrRatio: 'Rasio DSR Terhitung',
      creditScoreLabel: 'Internal Credit Score',
      slikStatusLabel: 'Status SLIK / OJK',
      riskStatusHealthy: 'Risiko Sehat (DSR ≤ 30%)',
      riskStatusModerate: 'Risiko Sedang (DSR 31% - 40%)',
      riskStatusHigh: 'Risiko Tinggi (DSR > 40%)',
      secCaVerification: 'Hasil Tele-Verifikasi CA',
      teleVerifyLabel: 'Catatan Verifikasi Debitur (Telepon)',
      teleVerifyPlaceholder: 'Contoh: Debitur terverifikasi via telepon, data pekerjaan sesuai...',
      callRelatLabel: 'Catatan Kontak Darurat (Telepon)',
      callRelatPlaceholder: 'Contoh: Kontak darurat mengonfirmasi hubungan keluarga...',
      secCaDecision: 'Rekomendasi Credit Analyst (Layer 1)',
      recommendedPlafon: 'Rekomendasi Plafon Disetujui (Rp)',
      recommendedTenor: 'Rekomendasi Tenor Pinjaman',
      caReviewNotes: 'Catatan Analisis CA',
      caNotesPlaceholder: 'Jelaskan alasan penyesuaian nilai, analisa DSR, dan pertimbangan risiko...',
      btnApproveToSpv: 'Setujui & Teruskan ke Supervisor',
      btnRejectCa: 'Tolak Pengajuan (CA)',
      rejectionReasonLabel: 'Alasan Penolakan',
      rejectionReasonPlaceholder: 'Tuliskan alasan penolakan berkas...',
      secSpvDecision: 'Keputusan Final Supervisor (Layer 2)',
      finalPlafon: 'Plafon Final Disetujui (Rp)',
      finalTenor: 'Tenor Final Disetujui',
      spvNotesLabel: 'Catatan Keputusan Supervisor',
      spvNotesPlaceholder: 'Catatan supervisor mengenai limit final dan keputusan komite...',
      btnReturnToCa: 'Kembalikan ke CA untuk Revisi',
      btnRejectSpv: 'Tolak Pengajuan (Spv)',
      btnFinalApproveOffering: 'Final Approve & Kirim Penawaran ke Nasabah',
      secCustomerOffering: 'Penawaran & Akad Nasabah',
      customerOfferingDesc:
        'Plafon dan tenor disetujui telah dikirim ke aplikasi nasabah. Pengajuan akan diproses pencairan setelah nasabah menyetujui akad di mobile banking.',
      btnSimulateCustomerAcceptance: 'Simulasi Nasabah Setuju Akad (Demo)',
      secDisbursement: 'Pencairan Dana (Disbursement)',
      disbursementDesc:
        'Akad telah disetujui oleh nasabah. Siap untuk dieksekusi pencairan ke Core Banking USSI.',
      btnExecuteDisbursement: 'Eksekusi Pencairan Sekarang',
      repaymentPlanTitle: 'Rencana Pembayaran & Jadwal Angsuran',
      badgeDefinitive: 'Jadwal Definitif',
      badgeSimulation: 'Simulasi Pencairan',
      netReceivedAmount: 'Dana Bersih Diterima Nasabah',
      serviceFee: 'Biaya Layanan (6% dipotong di muka)',
      interestRatePerMonth: 'Suku Bunga Bulanan',
      installment1: 'Angsuran Bulan 1',
      installment23: 'Angsuran Bulan 2 & 3',
      toggleSchedule: 'Tabel Jadwal',
      colInstallmentNo: 'Angs. #',
      colDueDate: 'Jatuh Tempo',
      colPrincipal: 'Pokok',
      colInterest: 'Bunga',
      colTotalInstallment: 'Total Angsuran',
      auditTrailTitle: 'Riwayat Keputusan & Audit Trail Multi-Layer',
      noAuditLogs: 'Belum ada riwayat review tercatat untuk berkas ini.',
      // Extended keys
      secEmployment: 'Pekerjaan',
      secAddress: 'Alamat Rumah',
      cityLabel: 'Kota',
      provinceLabel: 'Provinsi',
      profileIncomplete: 'Data profil debitur lengkap belum tersedia. Gunakan tombol Edit atau tambahkan melalui sistem sumber.',
      deviceModelLabel: 'Model Perangkat',
      faceMatchScore: 'Face Match Score',
      notAvailable: 'Tidak tersedia',
      scoringTitle: 'Input & Penyesuaian Scoring Kredit',
      saveScoring: 'Simpan Perubahan Scoring',
      slikKol1: 'Kol-1: LANCAR (Kolektibilitas 1)',
      slikKol2: 'Kol-2: DALAM PERHATIAN KHUSUS (Tunggakan 1-90 hari)',
      slikKol3: 'Kol-3: KURANG LANCAR (Tunggakan 91-120 hari)',
      slikKol4: 'Kol-4: DIRAGUKAN (Tunggakan 121-180 hari)',
      slikKol5: 'Kol-5: MACET (Tunggakan >180 hari)',
      slikStatusDesc: 'Hasil verifikasi iDeb Sistem Layanan Informasi Keuangan',
      creditScoreDesc: 'Rentang skor kredit standar perbankan: 300 - 850',
      scoringExcellent: 'Sangat Baik',
      scoringGood: 'Baik',
      scoringFair: 'Cukup',
      scoringHighRisk: 'Risiko Tinggi',
      monthlyIncomeVerified: 'Penghasilan Bulanan Terverifikasi (Rp)',
      nominalLabel: 'Nominal',
      dsrRatioLabel: 'Rasio DSR (%)',
      autoCalc: 'Hitung Otomatis',
      dsrCalcFormula: '(Cicilan / Gaji) × 100%',
      dsrCapacity: 'Kapasitas Bayar (DSR Ratio)',
      dsrSafeLimit: 'Batas Aman Maksimum 40%',
      dsrWarning: 'melebihi batas 40% — kapasitas pembayaran debitur berisiko tinggi',
      repaymentObligationTitle: 'Kewajiban Angsuran yang Ditanggung',
      interestFlatLabel: 'Bunga flat',
      monthlyInstallmentLabel: 'Cicilan Bulanan',
      totalInterestLabel: 'Total Beban Bunga',
      deviceModelLabel2: 'Device Model',
      teleVerifyResults: 'Hasil Verifikasi Telepon (CA)',
      teleVerifyLabel2: 'Telepon Debitur',
      callRelatLabel2: 'Telepon Kontak Darurat',
      teleVerifyChecklistTitle: 'Checklist Verifikasi Telepon',
      caNotesSectionTitle: 'Catatan Analisis CA',
      caRecommendationTitle: 'Rekomendasi CA',
      creditRecommendationTitle: 'Rekomendasi Nilai Kredit',
      caNotesLabel: 'Catatan Analisis Kredit (CA Notes)',
      monthsLabel: 'Bulan',
      tenorLabel: 'Tenor (Bulan)',
      month30Days: 'Bulan (30 Hari)',
      month60Days: 'Bulan (60 Hari)',
      month90Days: 'Bulan (90 Hari)',
      rejectionReasonCa: 'Alasan Penolakan Analis Kredit',
      rejectionReasonSpv: 'Alasan Penolakan Supervisor',
      rejectionPlaceholder: 'Contoh: DSR melebihi 40%, dokumen tidak sesuai...',
      returnReasonLabel: 'Alasan Pengembalian ke CA',
      returnPlaceholder: 'Tuliskan hal yang perlu diklarifikasi kembali oleh CA...',
      btnSendToSpv: 'Kirim Rekomendasi ke Supervisor',
      btnReject: 'Tolak',
      btnCancel: 'Batal',
      btnConfirmReject: 'Konfirmasi Tolak',
      btnConfirmRejectFinal: 'Konfirmasi Tolak Final',
      btnConfirmReturn: 'Konfirmasi Kembalikan',
      btnFinalApprove: 'Final Approve & Terbitkan Offering',
      btnReturnToCa2: 'Kembalikan ke CA',
      rejectedByCa: 'Ditolak oleh Credit Analyst',
      rejectedBySpv: 'Pengajuan Ditolak oleh Supervisor',
      waitingCustomerConfirmation: 'Menunggu Konfirmasi Akad oleh Nasabah',
      btnCustomerAccept: 'Simulasi: Nasabah Setuju',
      btnCustomerDecline: 'Simulasi: Nasabah Batal',
      readyToDisbursed: 'Persetujuan Lengkap — Siap Dicairkan ke IBSCore',
      processingDisburse: 'Memproses ke IBSCore...',
      btnDisburse: 'Eksekusi Pencairan Dana (Disburse via USSI IBSCore)',
      loanDisbursed: 'Pinjaman Telah Aktif & Berhasil Dicairkan',
      auditTitle: 'Riwayat Approval & Audit Trail',
      noAuditLog: 'Belum ada riwayat audit trail untuk pengajuan ini.',

      // Repayment Card additions
      netDisbursedNote: '(Transfer Bersih ke Rekening)',
      totalRepaymentLabel: 'Total Pembayaran',
      loanInterestLabel: 'Bunga Pinjaman',
      firstInstallmentLabel: 'Angsuran Pertama',
      principalPlusInterest: 'Pokok + Bunga',
      upfrontFeeSuffix: 'di muka',
      repaymentRoundingNote: 'Biaya dan bunga akan tetap sama untuk pembayaran awal. Sisa pembulatan pokok dialokasikan pada Angsuran 1.',
      scheduleDueDetail: 'Rincian Jadwal Jatuh Tempo & Nilai Angsuran:',
      hideSchedule: 'Sembunyikan',
      viewScheduleDetail: 'Lihat Rincian Lengkap',
      installmentLabel: 'Angsuran',
      dueDateLabel: 'Jatuh Tempo',
      includedPrincipal: 'Termasuk pokok',
      includedInterest: 'bunga pinjaman',

      // Toast & Alerts in Drawer
      toastScoringSaved: 'Data scoring & SLIK berhasil disimpan ke database!',
      toastScoringSaveFailed: 'Gagal menyimpan scoring',
      toastCaSentToSpv: 'Rekomendasi CA & data scoring berhasil dikirim ke Supervisor!',
      toastCaSaveFailed: 'Gagal menyimpan',
      toastCaRejected: 'Pengajuan telah ditolak oleh CA.',
      toastSpvApproved: 'Final Approval berhasil! Offering otomatis diterbitkan ke nasabah.',
      toastSpvReturned: 'Berkas berhasil dikembalikan ke Credit Analyst.',
      toastSpvRejected: 'Pengajuan ditolak oleh Supervisor.',
      toastCustomerAccepted: 'Nasabah menyetujui penawaran! Berkas siap dicairkan.',
      toastCustomerDeclined: 'Nasabah menolak penawaran.',
      toastDisbursedSuccess: 'Dana berhasil dicairkan ke rekening nasabah via Core Banking USSI!',
      alertRejectReasonReq: 'Mohon isi alasan penolakan.',
      alertReturnReasonReq: 'Mohon tuliskan alasan pengembalian ke CA.',
      alertSpvRejectReasonReq: 'Mohon isi alasan penolakan Supervisor.',

      // Additional Drawer translations
      slikManualNoticeTitle: 'Integrasi SLIK / iDeb OJK Mandiri (Manual Input Analis Kredit)',
      slikManualNoticeDesc: 'Karena modul SLIK OJK belum terhubung via API live, Analis Kredit (CA) dapat melakukan pemutakhiran status kolektibilitas SLIK, credit score, dan penghasilan secara manual berdasarkan hasil verifikasi iDeb.',
      perMonthSuffix: '/ bln',
      spvNotesOptionalLabel: 'Catatan Supervisor (Opsional)',
      spvNotesOptionalPlaceholder: 'Tambahkan catatan persetujuan final supervisor...',
      offeringLetterSentDesc: (amt) => `Offering letter dengan nilai ${amt} telah diterbitkan. Pencairan hanya dapat dilakukan setelah nasabah menyetujui perjanjian kredit.`,
      netDisbursedCustomerLabel: 'Nominal Cair Bersih (Diterima Nasabah):',
      recipientAccountLabel: 'Rekening Penerima:',
      coreBankingParamsTitle: 'Detail Parameter Core Banking (IBS):',
      branchCodeLabel: 'Kode Kantor:',
      productCodeLabel: 'Produk Kredit:',
      realizationTypeLabel: 'Tipe Realisasi:',
      spkNoLabel: 'No SPK:',
      disbursedSuccessDesc: 'Dana telah berhasil dibukukan ke rekening tabungan nasabah. Fasilitas pinjaman telah resmi tercatat di Core Banking Bank Sentosa.',
      ibscoreProofTitle: 'Bukti Pembukuan IBSCore:',
      loanAccountNoLabel: 'No. Rekening Pinjaman:',
      receiptNoLabel: 'No. Kuitansi Transaksi:',
      auditActions: {
        RECOMMEND_APPROVAL: 'RECOMMEND APPROVAL',
        APPROVE_APPLICATION: 'APPROVE APPLICATION',
        REJECT_CA: 'REJECT (CA)',
        REJECT_SPV: 'REJECT (SPV)',
        RETURN_TO_CA: 'RETURN TO CA',
        CUSTOMER_ACCEPT: 'CUSTOMER ACCEPT',
        CUSTOMER_DECLINE: 'CUSTOMER DECLINE',
        DISBURSE_FUNDS: 'DISBURSE FUNDS',
        DISBURSEMENT_SUCCESS: 'DISBURSEMENT SUCCESS',
        DISBURSEMENT_REJECTED: 'DISBURSEMENT REJECTED',
        SUBMIT_APPLICATION: 'SUBMIT APPLICATION',
      },
      auditRoles: {
        CREDIT_ANALYST: 'Credit Analyst',
        SUPERVISOR: 'Supervisor',
        CREDIT_SUPERVISOR: 'Credit Supervisor',
        CUSTOMER: 'Nasabah Debitur',
        TREASURY: 'Treasury / Ops',
        DISBURSEMENT_OPS: 'Disbursement Ops',
        SYSTEM: 'Sistem',
        SUPER_ADMIN: 'Super Admin',
      },
    },
    login: {
      title: 'Bank Sentosa',
      subtitle: 'Credit Approval System • Internal Risk Management Portal',
      emailLabel: 'Email Kantor',
      passwordLabel: 'Kata Sandi',
      signingIn: 'Memproses login...',
      signInBtn: 'Masuk ke Portal',
      demoHint: 'Akun default demo: jimmy.dolly@banksentosa.co.id',
    },
    footer: {
      copyright:
        'PT BPR Karya Prima Sentosa • Internal Credit Approval Portal • Database PostgreSQL: ca-dashboard',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  formatDateByLang: (date: string | Date | null | undefined) => string;
  formatAuditNote: (note: string) => string;
  formatLoanType: (loanType: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'bank_sentosa_lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored && (stored === 'en' || stored === 'zh' || stored === 'id')) {
        setLanguageState(stored);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore localStorage errors
    }
  };

  const formatDateByLang = (dateInput: string | Date | null | undefined): string => {
    if (!dateInput) return '-';
    try {
      const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      if (isNaN(d.getTime())) return String(dateInput);

      if (language === 'zh') {
        return d.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } else if (language === 'id') {
        return d.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } else {
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    } catch {
      return String(dateInput);
    }
  };

  const formatAuditNote = (notes: string): string => {
    if (!notes) return '';
    if (language === 'id') return notes;

    let translated = notes;

    if (language === 'zh') {
      translated = translated
        .replace(/Analisa kredit lolos verifikasi\. Plafon rekomendasi: (Rp [\d\.,]+)\.?(.*)/i, '信贷初审审核通过。建议批准授信：$1。$2')
        .replace(/Analisa verifikasi data debitur dan kapasitas bayar disetujui\./i, '借款人身份核实及还款能力评估已通过。')
        .replace(/Persetujuan komite kredit diterbitkan\. Plafon disetujui: (Rp [\d\.,]+)\.?(.*)/i, '风控信贷委员会终审批准。最终批准额度：$1。$2')
        .replace(/Ditolak oleh Credit Analyst\. Alasan: (.*)/i, '已被信贷分析员初审拒绝。原因：$1')
        .replace(/Tidak memenuhi syarat kelayakan kredit\./i, '未达到信贷准入准则。')
        .replace(/Ditolak pada tahap approval komite SPV\. Catatan: (.*)/i, '主管终审委员会阶段拒绝。批注：$1')
        .replace(/Persetujuan kredit tidak disetujui komite\./i, '信贷申请未获风控委员会批准。')
        .replace(/Nasabah menyetujui penawaran fasilitas kredit dan menandatangani akad kredit digital\./i, '借款人已确认授信方案，并在线签署数字化借款合同。')
        .replace(/Nasabah menyetujui Perjanjian Kredit digital melalui Mobile App\./i, '借款人已通过手机 App 确认数字化借款合同。')
        .replace(/Pencairan dibatalkan oleh admin pada antrean lending \(Loan Rejection\)\. Limit kredit nasabah telah dikembalikan ke saldo kuota\./i, '放款队列中被管理员取消。客户授信额度已恢复至额度池。')
        .replace(/Fasilitas kredit berhasil dicairkan ke rekening debitur \((.*?)\)\./i, '贷款资金已成功发放至借款人收款账户 ($1)。')
        .replace(/Dana sukses dicairkan ke Rekening (.*?) via USSI CBS\. No Rekening Pinjaman: (.*?), Kuitansi: (.*?)\./i, '资金已通过 USSI 核心系统成功入账至借款人账户 $1。贷款账号：$2，收据凭证：$3。')
        .replace(/Ditolak pada analisis tahap 1 karena risiko kredit melebihi batas toleransi\./i, '初审阶段拒绝：信贷风险超出银行可承受阀值。')
        .replace(/Pengajuan kredit diajukan melalui Mobile App H5\./i, '客户通过手机 App H5 提交借款申请。')
        .replace(/Pengajuan kredit diajukan nasabah\./i, '客户已提交借款申请。')
        .replace(/Pengajuan diajukan\./i, '借款申请已提交。')
        .replace(/DSR masuk batas wajar\. Rekomendasi approval (Rp [\d\.,]+) dengan tenor (\d+) bulan\./i, 'DSR 处于合理安全区间。建议批准 $1，期限 $2 个月。')
        .replace(/Rekomendasi disetujui penuh (Rp [\d\.,]+)\./i, '建议全额批准 $1。')
        .replace(/Final approval diberikan\. Surat penawaran \(offering\) dikirim ke nasabah\./i, '终审批准通过。借款合同协议已发送至客户。')
        .replace(/Disetujui (Rp [\d\.,]+)\./i, '已批准 $1。');
    } else if (language === 'en') {
      translated = translated
        .replace(/Analisa kredit lolos verifikasi\. Plafon rekomendasi: (Rp [\d\.,]+)\.?(.*)/i, 'Credit analysis verified. Recommended limit: $1. $2')
        .replace(/Analisa verifikasi data debitur dan kapasitas bayar disetujui\./i, 'Debtor identity verification and repayment capacity approved.')
        .replace(/Persetujuan komite kredit diterbitkan\. Plafon disetujui: (Rp [\d\.,]+)\.?(.*)/i, 'Credit committee approval issued. Approved limit: $1. $2')
        .replace(/Ditolak oleh Credit Analyst\. Alasan: (.*)/i, 'Rejected by Credit Analyst. Reason: $1')
        .replace(/Tidak memenuhi syarat kelayakan kredit\./i, 'Does not meet credit eligibility criteria.')
        .replace(/Ditolak pada tahap approval komite SPV\. Catatan: (.*)/i, 'Rejected at SPV committee approval stage. Notes: $1')
        .replace(/Persetujuan kredit tidak disetujui komite\./i, 'Loan request not approved by credit committee.')
        .replace(/Nasabah menyetujui penawaran fasilitas kredit dan menandatangani akad kredit digital\./i, 'Customer accepted credit facility offer and signed digital loan agreement.')
        .replace(/Nasabah menyetujui Perjanjian Kredit digital melalui Mobile App\./i, 'Customer approved digital Loan Agreement via Mobile App.')
        .replace(/Pencairan dibatalkan oleh admin pada antrean lending \(Loan Rejection\)\. Limit kredit nasabah telah dikembalikan ke saldo kuota\./i, 'Disbursement canceled in lending queue (Loan Rejection). Customer credit limit restored.')
        .replace(/Fasilitas kredit berhasil dicairkan ke rekening debitur \((.*?)\)\./i, 'Credit facility successfully disbursed to debtor account ($1).')
        .replace(/Dana sukses dicairkan ke Rekening (.*?) via USSI CBS\. No Rekening Pinjaman: (.*?), Kuitansi: (.*?)\./i, 'Funds successfully disbursed to Account $1 via USSI CBS. Loan Account: $2, Receipt: $3.')
        .replace(/Ditolak pada analisis tahap 1 karena risiko kredit melebihi batas toleransi\./i, 'Rejected in stage 1 analysis: credit risk exceeds tolerance limit.')
        .replace(/Pengajuan kredit diajukan melalui Mobile App H5\./i, 'Credit application submitted via Mobile App H5.')
        .replace(/Pengajuan kredit diajukan nasabah\./i, 'Credit application submitted by customer.')
        .replace(/Pengajuan diajukan\./i, 'Application submitted.')
        .replace(/DSR masuk batas wajar\. Rekomendasi approval (Rp [\d\.,]+) dengan tenor (\d+) bulan\./i, 'DSR within safe threshold. Recommended approval of $1 with tenor of $2 months.')
        .replace(/Rekomendasi disetujui penuh (Rp [\d\.,]+)\./i, 'Recommended full approval of $1.')
        .replace(/Final approval diberikan\. Surat penawaran \(offering\) dikirim ke nasabah\./i, 'Final approval granted. Offering letter sent to customer.')
        .replace(/Disetujui (Rp [\d\.,]+)\./i, 'Approved $1.');
    }

    return translated;
  };

  const formatLoanType = (loanType: string): string => {
    if (!loanType) return '';
    const clean = loanType.toUpperCase().trim();
    if (language === 'zh') {
      if (clean === 'PAYDAY_LOAN' || clean === 'PAYDAY') return '发薪日贷款 (Payday Loan)';
      if (clean === 'PERSONAL_LOAN' || clean === 'PERSONAL') return '个人消费贷款 (Personal Loan)';
      if (clean === 'INSTALLMENT_LOAN') return '分期还款贷款 (Installment Loan)';
      if (clean === 'MICRO_LOAN') return '小额普惠贷款 (Micro Loan)';
      return clean.replace(/_/g, ' ');
    } else if (language === 'id') {
      if (clean === 'PAYDAY_LOAN' || clean === 'PAYDAY') return 'Pinjaman Kilat (Payday)';
      if (clean === 'PERSONAL_LOAN' || clean === 'PERSONAL') return 'Pinjaman Pribadi';
      if (clean === 'INSTALLMENT_LOAN') return 'Pinjaman Angsuran';
      if (clean === 'MICRO_LOAN') return 'Pinjaman Mikro';
      return clean.replace(/_/g, ' ');
    } else {
      return clean.split('_').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
    }
  };

  const t = dictionaries[language] || dictionaries.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatDateByLang, formatAuditNote, formatLoanType }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
