export const VNPAY_CONFIG = {
  vnp_TmnCode: "PQGBN1S7",
  vnp_HashSecret: "I1BZYGE87DOVP1CJGONLQRDEPPIZ41AZ",

  // URL cổng thanh toán VNPay (Sandbox)
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",

  // URL API để truy vấn giao dịch
  vnp_Api: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",

  // URL mà VNPay sẽ redirect sau khi thanh toán (React Native - sử dụng deep linking)
  // Trong production, thay bằng URL scheme của app: myapp://payment-result
  // Hoặc sử dụng universal links/website URL dẫn đến app
  vnp_ReturnUrl: "directions-sectors-seemed-aspect.trycloudflare.com", // Thay bằng domain thực tế
};