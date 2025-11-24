package hu.bme.mit.randomchat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenAIService {
    
    @Value("${openai.api.key}")
    private String apiKey;
    
    @Value("${openai.api.url}")
    private String apiUrl;
    
    @Value("${openai.model}")
    private String model;
    
    @Value("${openai.timeout:10000}")
    private int timeout;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public String chatCompletion(List<Map<String, String>> messages) {
        try {
            RestTemplate restTemplate = new RestTemplateBuilder()
                    .setConnectTimeout(Duration.ofMillis(timeout))
                    .setReadTimeout(Duration.ofMillis(timeout))
                    .build();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 500);
            requestBody.put("temperature", 0.7);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    request,
                    String.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                String content = jsonNode.path("choices").get(0)
                        .path("message").path("content").asText();
                
                log.info("OpenAI API call successful");
                return content;
            }
            
            throw new RuntimeException("OpenAI API returned non-OK status");
            
        } catch (Exception e) {
            log.error("Error calling OpenAI API", e);
            return "Sorry, I'm having trouble responding right now. Please try again.";
        }
    }
    
    public String generateAssistance(String prompt, String text) {
        String systemPrompt = "You are a helpful assistant that helps users compose messages. ";
        
        if (prompt != null && !prompt.isEmpty()) {
            systemPrompt += prompt;
        } else {
            systemPrompt += "Help improve or complete the following message.";
        }
        
        List<Map<String, String>> messages = List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", text != null ? text : "")
        );
        
        return chatCompletion(messages);
    }
}
