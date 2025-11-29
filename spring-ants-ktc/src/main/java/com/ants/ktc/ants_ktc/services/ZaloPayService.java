package com.ants.ktc.ants_ktc.services;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ZaloPayService {

    @Value("${zalopay.create-order-url}")
    private String createOrderUrl;

    @Value("${zalopay.query-url}")
    private String queryUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Gọi API tạo đơn hàng ZaloPay
     */
    public Map<String, Object> createOrder(Map<String, String> params) {
        try {
            System.out.println("=== CALLING ZALOPAY API ===");
            System.out.println("URL: " + createOrderUrl);
            System.out.println("Params: " + params);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            params.forEach(formData::add);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(formData, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(createOrderUrl, request, String.class);
            
            System.out.println("Response status: " + response.getStatusCode());
            System.out.println("Response body: " + response.getBody());

            return objectMapper.readValue(response.getBody(), new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            System.err.println("=== ZALOPAY API ERROR ===");
            e.printStackTrace();
            throw new RuntimeException("Error calling ZaloPay create order API: " + e.getMessage(), e);
        }
    }

    /**
     * Gọi API truy vấn trạng thái đơn hàng
     */
    public Map<String, Object> queryOrderStatus(Map<String, String> params) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            params.forEach(formData::add);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(formData, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(queryUrl, request, String.class);
            
            return objectMapper.readValue(response.getBody(), new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Error calling ZaloPay query status API", e);
        }
    }
}