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

import java.net.URI;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleAIService implements AIChatProvider {

    private static final String CONTENT = "content";

    @Value("${google.ai.api.key:}")
    private String apiKey;

    @Value("${google.ai.api.url:}")
    private String apiUrl;

    @Value("${google.ai.timeout:10000}")
    private int timeout;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String chatCompletion(List<Map<String, String>> messages) {
        try {
            RestTemplate restTemplate = new RestTemplateBuilder()
                    .setConnectTimeout(Duration.ofMillis(timeout))
                    .setReadTimeout(Duration.ofMillis(timeout))
                    .build();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", convertMessagesToGoogleFormat(messages));
            requestBody.put("generationConfig", Map.of(
                    "maxOutputTokens", 500,
                    "temperature", 0.7
            ));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            URI uri = URI.create(apiUrl.trim() + "?key=" + apiKey.trim());
            String jsonBodyString = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(requestBody);
            log.info("Request Payload:\n{}", jsonBodyString);
            ResponseEntity<String> response = restTemplate.exchange(
                    uri,
                    HttpMethod.POST,
                    request,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                if (jsonNode.path("candidates").isEmpty()) {
                    log.warn("Google AI returned no candidates. Response: {}", response.getBody());
                    return "No response generated.";
                }

                String content = jsonNode.path("candidates").get(0)
                        .path("content").path("parts").get(0)
                        .path("text").asText();

                log.info("Google AI API call successful");
                return content;
            }

            throw new RuntimeException("Google AI API returned non-OK status");

        } catch (Exception e) {
            log.error("Error calling Google AI API", e);
            return "Sorry, I'm having trouble responding right now. Please try again.";
        }
    }

    @Override
    public String generateAssistance(String prompt, String text) {
        String systemPrompt = "You are a helpful assistant that helps users compose messages. ";

        if (prompt != null && !prompt.isEmpty()) {
            systemPrompt += prompt;
        } else {
            systemPrompt += "Help improve or complete the following message.";
        }

        List<Map<String, String>> messages = List.of(
                Map.of("role", "user", CONTENT, systemPrompt + "\n\n" + (text != null ? text : ""))
        );

        return chatCompletion(messages);
    }

    private List<Map<String, Object>> convertMessagesToGoogleFormat(List<Map<String, String>> messages) {
        return messages.stream()
                .map(msg -> {
                    Map<String, Object> googleMsg = new HashMap<>();
                    String role = msg.get("role");
                    // Google AI uses "user" and "model" roles
                    String googleRole = "system".equals(role) ? "user" : role;
                    googleMsg.put("role", googleRole);

                    Map<String, String> parts = new HashMap<>();
                    parts.put("text", msg.get(CONTENT));
                    googleMsg.put("parts", List.of(parts));

                    return googleMsg;
                })
                .toList();
    }
}
