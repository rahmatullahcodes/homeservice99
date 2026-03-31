export const DEFAULT_PAYMENT_GATEWAYS = {
  defaultGateway: "cod",
  cod: {
    enabled: true,
    displayName: "Cash on Delivery",
    description: "Pay after the service is completed"
  },
  razorpay: {
    enabled: false,
    displayName: "Razorpay",
    description: "UPI, cards and netbanking via Razorpay Checkout",
    keyId: "",
    keySecret: "",
    webhookSecret: ""
  },
  bharatpe: {
    enabled: false,
    displayName: "BharatPe Merchant",
    description: "Collect payment using BharatPe merchant details or UPI",
    merchantId: "",
    keyId: "",
    keySecret: "",
    merchantName: "",
    merchantUpiId: ""
  },
  bank_transfer: {
    enabled: false,
    displayName: "Manual Bank Transfer",
    description: "Collect payment by sharing bank account details",
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: "",
    merchantUpiId: ""
  },
  paytm: {
    enabled: false,
    displayName: "Paytm Merchant",
    description: "Collect payment using Paytm merchant details or UPI",
    merchantId: "",
    merchantKey: "",
    website: "DEFAULT",
    industryTypeId: "Retail",
    merchantName: "",
    merchantUpiId: ""
  }
};

export const GATEWAY_CODES = ["cod", "razorpay", "bharatpe", "paytm", "bank_transfer"];

export const gatewayCards = [
  {
    code: "cod",
    title: "Cash on Delivery",
    summary: "Offline payment after service completion.",
    fields: [
      { key: "displayName", label: "Display Name" },
      { key: "description", label: "Description" }
    ]
  },
  {
    code: "razorpay",
    title: "Razorpay",
    summary: "Instant checkout for UPI, cards and netbanking.",
    fields: [
      { key: "displayName", label: "Display Name" },
      { key: "description", label: "Description" },
      { key: "keyId", label: "Key ID" },
      { key: "keySecret", label: "Key Secret", type: "password" },
      { key: "webhookSecret", label: "Webhook Secret", type: "password" }
    ]
  },
  {
    code: "bharatpe",
    title: "BharatPe Merchant",
    summary: "Merchant collection flow with UPI or transaction reference.",
    fields: [
      { key: "displayName", label: "Display Name" },
      { key: "description", label: "Description" },
      { key: "merchantId", label: "Merchant ID" },
      { key: "keyId", label: "Key ID" },
      { key: "keySecret", label: "Secret Key", type: "password" },
      { key: "merchantName", label: "Merchant Name" },
      { key: "merchantUpiId", label: "Merchant UPI ID" }
    ]
  },
  {
    code: "paytm",
    title: "Paytm Merchant",
    summary: "Merchant collection flow with Paytm config and UPI support.",
    fields: [
      { key: "displayName", label: "Display Name" },
      { key: "description", label: "Description" },
      { key: "merchantId", label: "Merchant ID" },
      { key: "merchantKey", label: "Merchant Key", type: "password" },
      { key: "website", label: "Website" },
      { key: "industryTypeId", label: "Industry Type ID" },
      { key: "merchantName", label: "Merchant Name" },
      { key: "merchantUpiId", label: "Merchant UPI ID" }
    ]
  },
  {
    code: "bank_transfer",
    title: "Manual Bank Transfer",
    summary: "Collect payment by sharing bank details.",
    fields: [
      { key: "displayName", label: "Display Name" },
      { key: "description", label: "Description" },
      { key: "accountHolderName", label: "Account Holder Name" },
      { key: "bankName", label: "Bank Name" },
      { key: "accountNumber", label: "Account Number" },
      { key: "ifscCode", label: "IFSC Code" },
      { key: "branchName", label: "Branch Name" },
      { key: "merchantUpiId", label: "UPI ID" }
    ]
  }
];
