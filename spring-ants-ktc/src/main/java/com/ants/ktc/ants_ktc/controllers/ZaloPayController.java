package com.ants.ktc.ants_ktc.controllers;

import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ants.ktc.ants_ktc.dtos.transaction.CreateTransactionRequestDto;
import com.ants.ktc.ants_ktc.services.TransactionService;
import com.ants.ktc.ants_ktc.services.ZaloPayService;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/zalopay")
public class ZaloPayController {

    @Value("${zalopay.app-id}")
    private String appId;

    @Value("${zalopay.key1}")
    private String key1;

    @Value("${zalopay.key2}")
    private String key2;

    @Autowired
    private ZaloPayService zaloPayService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * API tạo đơn hàng ZaloPay cho App to App
     * Mobile app sẽ gọi API này để lấy zptranstoken và orderurl
     */
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body) {
        try {
            System.out.println("=== CREATE ORDER REQUEST ===");
            System.out.println("Body: " + body);

            // Validate request body
            if (!body.containsKey("amount") || body.get("amount") == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Missing required field: amount"
                ));
            }

            if (!body.containsKey("userId") || body.get("userId") == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Missing required field: userId"
                ));
            }

            // Lấy thông tin từ request
            long amount = Long.parseLong(body.get("amount").toString());
            String description = body.get("description") != null ? body.get("description").toString() : "Nạp tiền vào ví";
            UUID userId = UUID.fromString(body.get("userId").toString());

            // Tạo transId theo format yyMMdd_xxxxxx
            Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("GMT+7"));
            SimpleDateFormat sdf = new SimpleDateFormat("yyMMdd");
            String transId = sdf.format(cal.getTime()) + "_" + System.currentTimeMillis();

            System.out.println("Transaction ID: " + transId);
            System.out.println("Amount: " + amount);

            // Chuẩn bị dữ liệu đơn hàng
            Map<String, Object> embedData = new HashMap<>();
            embedData.put("merchantinfo", "user_" + userId);
            embedData.put("promotioninfo", "");
            
            Map<String, Object> item = new HashMap<>();
            item.put("itemid", "wallet_topup");
            item.put("itemname", "Nạp tiền ví");
            item.put("itemprice", amount);
            item.put("itemquantity", 1);

            String embedDataStr = objectMapper.writeValueAsString(embedData);
            String itemStr = "[" + objectMapper.writeValueAsString(item) + "]";

            // Tạo đơn hàng với ZaloPay
            Map<String, String> orderParams = new HashMap<>();
            orderParams.put("app_id", appId);  // ZaloPay dùng app_id thay vì appid
            orderParams.put("app_user", userId.toString().substring(0, 8));  // Rút ngắn userId
            orderParams.put("app_time", String.valueOf(System.currentTimeMillis()));
            orderParams.put("amount", String.valueOf(amount));
            orderParams.put("app_trans_id", transId);  // ZaloPay dùng app_trans_id
            orderParams.put("embed_data", embedDataStr);  // ZaloPay dùng embed_data
            orderParams.put("item", itemStr);
            orderParams.put("description", description);
            orderParams.put("bank_code", "");  // Bắt buộc có field này, để trống cho App to App
            
            // Tính MAC theo đúng spec ZaloPay
            // Format: app_id|app_trans_id|app_user|amount|app_time|embed_data|item
            String data = appId + "|" + transId + "|" + orderParams.get("app_user") + "|" + amount + "|" 
                + orderParams.get("app_time") + "|" + embedDataStr + "|" + itemStr;
            orderParams.put("mac", hmacSHA256(key1, data));

            System.out.println("=== ZALOPAY REQUEST PARAMS ===");
            System.out.println("app_id: " + orderParams.get("app_id"));
            System.out.println("app_trans_id: " + orderParams.get("app_trans_id"));
            System.out.println("amount: " + orderParams.get("amount"));
            System.out.println("mac: " + orderParams.get("mac"));
            System.out.println("data for mac: " + data);

            // Gọi API ZaloPay
            Map<String, Object> result = zaloPayService.createOrder(orderParams);

            System.out.println("=== ZALOPAY RESPONSE ===");
            System.out.println("Result: " + result);

            // Kiểm tra result không null
            if (result == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "ZaloPay API returned null response"
                ));
            }

            // Kiểm tra returncode
            Object returnCodeObj = result.get("return_code");  // ZaloPay API v2 dùng return_code
            
            String returnCodeStr = null;
            if (returnCodeObj != null) {
                returnCodeStr = returnCodeObj.toString();
            }

            System.out.println("Return code: " + returnCodeStr);

            if ("1".equals(returnCodeStr)) {
                // Thành công - lấy token
                Object zpTransToken = result.get("zp_trans_token");  // ZaloPay API v2 dùng zp_trans_token
                Object orderUrl = result.get("order_url");  // ZaloPay API v2 dùng order_url

                String token = zpTransToken != null ? zpTransToken.toString() : null;
                String url = orderUrl != null ? orderUrl.toString() : null;

                if (token == null || url == null) {
                    System.err.println("Missing token or url in response!");
                    System.err.println("Available keys: " + result.keySet());
                    
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                        "success", false,
                        "message", "Missing zp_trans_token or order_url in ZaloPay response",
                        "debug", result
                    ));
                }

                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "transactionId", transId,
                    "zptranstoken", token,
                    "orderurl", url,
                    "returncode", 1
                ));
            } else {
                // Thất bại
                Object returnMsg = result.get("return_message");
                Object subReturnCode = result.get("sub_return_code");
                Object subReturnMsg = result.get("sub_return_message");
                
                String message = returnMsg != null ? returnMsg.toString() : "Create order failed";
                String subMessage = subReturnMsg != null ? " - " + subReturnMsg.toString() : "";

                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "message", message + subMessage,
                    "returncode", returnCodeStr != null ? Integer.parseInt(returnCodeStr) : -1,
                    "sub_return_code", subReturnCode != null ? subReturnCode : -1
                ));
            }

        } catch (Exception e) {
            System.err.println("=== ERROR IN CREATE ORDER ===");
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false, 
                    "error", e.getMessage() != null ? e.getMessage() : "Unknown error"
                ));
        }
    }

    /**
     * API callback từ ZaloPay khi thanh toán thành công
     * ZaloPay sẽ POST dữ liệu về endpoint này
     */
    @PostMapping("/callback")
    public ResponseEntity<?> callback(@RequestBody Map<String, String> callbackData) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            System.out.println("=== ZALOPAY CALLBACK ===");
            System.out.println("Data: " + callbackData);

            String dataStr = callbackData.get("data");
            String reqMac = callbackData.get("mac");

            if (dataStr == null || reqMac == null) {
                result.put("returncode", -1);
                result.put("returnmessage", "Missing data or mac");
                return ResponseEntity.ok(result);
            }

            // Verify MAC
            String mac = hmacSHA256(key2, dataStr);
            
            if (!reqMac.equals(mac)) {
                System.err.println("MAC verification failed!");
                System.err.println("Expected: " + mac);
                System.err.println("Received: " + reqMac);
                result.put("returncode", -1);
                result.put("returnmessage", "mac not equal");
                return ResponseEntity.ok(result);
            }

            // Parse data
            Map<String, Object> dataJson = objectMapper.readValue(dataStr, Map.class);
            
            // ZaloPay API v2 có thể dùng snake_case
            String appTransId = dataJson.get("app_trans_id") != null 
                ? dataJson.get("app_trans_id").toString() 
                : dataJson.get("apptransid").toString();
            
            String zpTransId = dataJson.get("zp_trans_id") != null
                ? dataJson.get("zp_trans_id").toString()
                : dataJson.get("zptransid").toString();
            
            long amount = Long.parseLong(dataJson.get("amount").toString());

            // Kiểm tra giao dịch đã tồn tại chưa
            if (transactionService.existsByTransactionCode(zpTransId)) {
                result.put("returncode", 2);
                result.put("returnmessage", "Transaction already processed");
                return ResponseEntity.ok(result);
            }

            // Lấy userId từ embeddata
            String embedDataStr = dataJson.get("embed_data") != null
                ? dataJson.get("embed_data").toString()
                : dataJson.get("embeddata").toString();
            Map<String, Object> embedData = objectMapper.readValue(embedDataStr, Map.class);
            String merchantInfo = embedData.get("merchantinfo").toString();
            UUID userId = UUID.fromString(merchantInfo.replace("user_", ""));

            // Lưu giao dịch
            CreateTransactionRequestDto dto = new CreateTransactionRequestDto();
            dto.setAmount(amount * 1.0);
            dto.setTransactionDate(new java.sql.Date(System.currentTimeMillis()));
            dto.setTransactionType(1); // 1 = Nạp tiền
            dto.setBankTransactionName("ZaloPay");
            dto.setTransactionCode(zpTransId);
            dto.setStatus(1); // 1 = Thành công
            dto.setDescription(dataJson.get("item").toString());

            transactionService.createTransactionByUserId(userId, dto);

            result.put("returncode", 1);
            result.put("returnmessage", "success");

        } catch (Exception e) {
            System.err.println("=== ERROR IN CALLBACK ===");
            e.printStackTrace();
            result.put("returncode", 0); // ZaloPay sẽ callback lại (tối đa 3 lần)
            result.put("returnmessage", e.getMessage());
        }

        return ResponseEntity.ok(result);
    }

    /**
     * API truy vấn trạng thái đơn hàng
     * Mobile app gọi API này để kiểm tra kết quả thanh toán
     */
    @PostMapping("/query-status")
    public ResponseEntity<?> queryStatus(@RequestBody Map<String, String> body) {
        try {
            String appTransId = body.get("apptransid");
            
            if (appTransId == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Missing apptransid"
                ));
            }

            String data = appId + "|" + appTransId + "|" + key1;
            String mac = hmacSHA256(key1, data);

            Map<String, String> params = new HashMap<>();
            params.put("appid", appId);
            params.put("apptransid", appTransId);
            params.put("mac", mac);

            Map<String, Object> result = zaloPayService.queryOrderStatus(params);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }


/**
 * API xác nhận thanh toán từ mobile
 * Mobile gọi API này sau khi nhận callback từ ZaloPay
 * Backend sẽ verify với ZaloPay và cộng tiền
 */
@PostMapping("/confirm-payment")
public ResponseEntity<?> confirmPayment(@RequestBody Map<String, String> body) {
    try {
        System.out.println("=== CONFIRM PAYMENT FROM MOBILE ===");
        System.out.println("Body: " + body);

        String appTransId = body.get("appTransId");
        String userId = body.get("userId");
        String returnCode = body.get("returnCode");

        if (appTransId == null || userId == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Missing required fields"
            ));
        }

        // Nếu mobile báo thất bại, không cần verify
        if (!"1".equals(returnCode)) {
            return ResponseEntity.ok(Map.of(
                "success", false,
                "message", "Payment not successful",
                "returnCode", returnCode
            ));
        }

        // Verify với ZaloPay bằng query API
        String data = appId + "|" + appTransId + "|" + key1;
        String mac = hmacSHA256(key1, data);

        Map<String, String> params = new HashMap<>();
        params.put("app_id", appId);
        params.put("app_trans_id", appTransId);
        params.put("mac", mac);

        System.out.println("Verifying with ZaloPay...");
        Map<String, Object> result = zaloPayService.queryOrderStatus(params);
        System.out.println("ZaloPay verification result: " + result);

        Object returnCodeObj = result.get("return_code");
        if (returnCodeObj != null && "1".equals(returnCodeObj.toString())) {
            // Thanh toán thành công, lấy thông tin
            Object zpTransIdObj = result.get("zp_trans_id");
            if (zpTransIdObj == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Missing transaction ID from ZaloPay"
                ));
            }

            String zpTransId = zpTransIdObj.toString();

            // Kiểm tra đã xử lý chưa (tránh duplicate)
            if (transactionService.existsByTransactionCode(zpTransId)) {
                System.out.println("Transaction already processed: " + zpTransId);
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Transaction already processed",
                    "alreadyProcessed", true
                ));
            }

            // Cộng tiền vào wallet
            UUID userUuid = UUID.fromString(userId);
            long amount = Long.parseLong(result.get("amount").toString());

            CreateTransactionRequestDto dto = new CreateTransactionRequestDto();
            dto.setAmount(amount * 1.0);
            dto.setTransactionDate(new java.sql.Date(System.currentTimeMillis()));
            dto.setTransactionType(1); // Nạp tiền
            dto.setBankTransactionName("ZaloPay");
            dto.setTransactionCode(zpTransId);
            dto.setStatus(1); // Thành công
            dto.setDescription("Nạp tiền qua ZaloPay App");

            var savedTransaction = transactionService.createTransactionByUserId(userUuid, dto);

            System.out.println("✅ Transaction created successfully: " + zpTransId);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Payment confirmed and processed",
                "transaction", savedTransaction,
                "zptransid", zpTransId
            ));
        } else {
            // ZaloPay báo chưa thanh toán hoặc thất bại
            String message = result.get("return_message") != null 
                ? result.get("return_message").toString() 
                : "Payment verification failed";

            return ResponseEntity.ok(Map.of(
                "success", false,
                "message", message,
                "verificationResult", result
            ));
        }

    } catch (Exception e) {
        System.err.println("=== ERROR IN CONFIRM PAYMENT ===");
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("success", false, "error", e.getMessage()));
    }
}

    // @PostMapping("/confirm-payment")
    // public ResponseEntity<?> confirmPayment(@RequestBody Map<String, String> body) {
    //     try {
    //         String appTransId = body.get("apptransid"); // FIXED: đúng key mà frontend gửi
            
    //         if (appTransId == null) {
    //             return ResponseEntity.badRequest().body(Map.of(
    //                 "success", false,
    //                 "message", "Missing apptransid"
    //             ));
    //         }

    //         System.out.println("=== CONFIRM PAYMENT REQUEST ===");
    //         System.out.println("apptransid: " + appTransId);

    //         // Query ZaloPay
    //         String data = appId + "|" + appTransId + "|" + key1;
    //         String mac = hmacSHA256(key1, data);

    //         Map<String, String> params = new HashMap<>();
    //         params.put("appid", appId);
    //         params.put("apptransid", appTransId);
    //         params.put("mac", mac);

    //         Map<String, Object> queryResult = zaloPayService.queryOrderStatus(params);

    //         System.out.println("=== ZALOPAY QUERY ===");
    //         System.out.println(queryResult);

    //         if (queryResult == null) {
    //             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
    //                 "success", false,
    //                 "message", "Query API returned null"
    //             ));
    //         }

    //         // FIXED: ZaloPay trả về returncode (không phải return_code)
    //         Object returnCodeObj = queryResult.get("returncode");
    //         String returnCode = returnCodeObj != null ? returnCodeObj.toString() : null;

    //         if (!"1".equals(returnCode)) {
    //             return ResponseEntity.ok(Map.of(
    //                 "success", false,
    //                 "message", "Payment not completed",
    //                 "returncode", returnCode
    //             ));
    //         }

    //         // Successful
    //         String zpTransId = queryResult.get("zptransid").toString(); // FIXED: đúng field

    //         // Prevent duplicate processing
    //         if (transactionService.existsByTransactionCode(zpTransId)) {
    //             return ResponseEntity.ok(Map.of(
    //                 "success", true,
    //                 "message", "Payment already recorded",
    //                 "transactionCode", zpTransId
    //             ));
    //         }

    //         // Parse embed_data (userId)
    //         String embedDataStr = queryResult.get("embeddata").toString();  // FIXED: đúng key
    //         Map<String, Object> embedData = objectMapper.readValue(embedDataStr, Map.class);

    //         UUID userId = UUID.fromString(embedData.get("merchantinfo").toString().replace("user_", ""));

    //         // Amount
    //         long amount = Long.parseLong(queryResult.get("amount").toString());

    //         // Item description (list)
    //         String description = queryResult.get("item").toString();

    //         // Create transaction
    //         CreateTransactionRequestDto dto = new CreateTransactionRequestDto();
    //         dto.setAmount((double) amount);
    //         dto.setTransactionDate(new java.sql.Date(System.currentTimeMillis()));
    //         dto.setTransactionType(1);
    //         dto.setBankTransactionName("ZaloPay");
    //         dto.setTransactionCode(zpTransId);
    //         dto.setStatus(1);
    //         dto.setDescription(description);

    //         var saved = transactionService.createTransactionByUserId(userId, dto);

    //         return ResponseEntity.ok(Map.of(
    //             "success", true,
    //             "message", "Payment confirmed & wallet updated",
    //             "transaction", saved
    //         ));

    //     } catch (Exception e) {
    //         System.err.println("=== ERROR CONFIRM PAYMENT ===");
    //         e.printStackTrace();
    //         return ResponseEntity.internalServerError().body(Map.of(
    //             "success", false,
    //             "error", e.getMessage()
    //         ));
    //     }
    // }

    // Helper method
    private String hmacSHA256(String key, String data) throws Exception {
        Mac hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        hmac.init(secretKey);
        byte[] bytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}