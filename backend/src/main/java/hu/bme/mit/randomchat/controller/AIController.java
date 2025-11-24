package hu.bme.mit.randomchat.controller;

import hu.bme.mit.randomchat.dto.AIAssistRequest;
import hu.bme.mit.randomchat.dto.AIChatRequest;
import hu.bme.mit.randomchat.dto.AIChatResponse;
import hu.bme.mit.randomchat.service.AIConversationService;
import hu.bme.mit.randomchat.service.OpenAIService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AIController {
    
    private final AIConversationService aiConversationService;
    private final OpenAIService openAIService;
    
    @PostMapping("/chat")
    public ResponseEntity<AIChatResponse> chatWithAI(@Valid @RequestBody AIChatRequest request) {
        String aiResponse = aiConversationService.chatWithAI(request.getSessionId(), request.getMessage());
        
        AIChatResponse response = AIChatResponse.builder()
                .response(aiResponse)
                .build();
        
        log.info("AI chat for session {}", request.getSessionId());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/assist")
    public ResponseEntity<AIChatResponse> assistMessage(@Valid @RequestBody AIAssistRequest request) {
        String assistance = openAIService.generateAssistance(request.getPrompt(), request.getText());
        
        AIChatResponse response = AIChatResponse.builder()
                .response(assistance)
                .build();
        
        log.info("AI assist: prompt='{}', text='{}'", request.getPrompt(), request.getText());
        return ResponseEntity.ok(response);
    }
}
