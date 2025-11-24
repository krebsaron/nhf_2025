package hu.bme.mit.randomchat.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import hu.bme.mit.randomchat.model.AIConversation;
import hu.bme.mit.randomchat.repository.AIConversationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIConversationService {

    private static final int MAX_HISTORY_MESSAGES = 20;
    private static final String CONTENT = "content";
    private static final String ROLE = "role";

    private final AIConversationRepository aiConversationRepository;
    private final AIChatProvider aiChatProvider;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public String chatWithAI(UUID sessionId, String userMessage) {
        try {
            // Get or create conversation
            AIConversation conversation = aiConversationRepository.findBySessionId(sessionId)
                    .orElseGet(() -> createNewConversation(sessionId));

            // Parse conversation history
            List<Map<String, String>> messages = parseConversationHistory(conversation.getConversationHistory());

            // Add system message if empty
            if (messages.isEmpty()) {
                messages.add(Map.of(ROLE, "system",
                        CONTENT, "You are a friendly chatbot keeping users company while they wait for a chat partner. Be conversational and engaging."));
            }

            // Add user message
            messages.add(Map.of(ROLE, "user", CONTENT, userMessage));

            // Limit history size
            if (messages.size() > MAX_HISTORY_MESSAGES) {
                List<Map<String, String>> systemMsg = messages.subList(0, 1);
                List<Map<String, String>> recent = messages.subList(messages.size() - MAX_HISTORY_MESSAGES + 1, messages.size());
                messages = new ArrayList<>();
                messages.addAll(systemMsg);
                messages.addAll(recent);
            }

            // Get AI response using the configured strategy
            String aiResponse = aiChatProvider.chatCompletion(messages);

            // Add AI response to history
            messages.add(Map.of(ROLE, "model", CONTENT, aiResponse));

            // Save updated conversation
            conversation.setConversationHistory(objectMapper.writeValueAsString(messages));
            aiConversationRepository.save(conversation);

            log.info("AI chat for session {}: user='{}', ai='{}'", sessionId, userMessage, aiResponse);

            return aiResponse;

        } catch (Exception e) {
            log.error("Error in AI chat for session " + sessionId, e);
            return "Sorry, I'm having trouble responding. Please try again.";
        }
    }

    private AIConversation createNewConversation(UUID sessionId) {
        AIConversation conversation = AIConversation.builder()
                .sessionId(sessionId)
                .conversationHistory("[]")
                .build();
        return aiConversationRepository.save(conversation);
    }

    private List<Map<String, String>> parseConversationHistory(String historyJson) {
        try {
            return objectMapper.readValue(historyJson, new TypeReference<>() {
            });
        } catch (Exception e) {
            log.error("Error parsing conversation history", e);
            return new ArrayList<>();
        }
    }

    @Transactional
    public void deleteConversation(UUID sessionId) {
        aiConversationRepository.deleteBySessionId(sessionId);
        log.info("Deleted AI conversation for session {}", sessionId);
    }
}
