package hu.bme.mit.randomchat.controller;

import hu.bme.mit.randomchat.dto.ChatMessageRequest;
import hu.bme.mit.randomchat.dto.ChatMessageResponse;
import hu.bme.mit.randomchat.model.Message;
import hu.bme.mit.randomchat.repository.MessageRepository;
import hu.bme.mit.randomchat.service.ChatRoomService;
import hu.bme.mit.randomchat.service.MatchmakingService;
import hu.bme.mit.randomchat.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {
    
    private final MessageRepository messageRepository;
    private final ChatRoomService chatRoomService;
    private final SessionService sessionService;
    private final MatchmakingService matchmakingService;
    private final SimpMessagingTemplate messagingTemplate;
    
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload @Valid ChatMessageRequest request) {
        try {
            // Verify session is in the room
            if (!chatRoomService.isSessionInRoom(request.getRoomId(), request.getSessionId())) {
                log.warn("Session {} tried to send message to room {} but is not a member", 
                        request.getSessionId(), request.getRoomId());
                return;
            }
            
            // Save message to database
            Message message = Message.builder()
                    .roomId(request.getRoomId())
                    .fromSessionId(request.getSessionId())
                    .content(request.getContent())
                    .isAI(false)
                    .build();
            
            Message savedMessage = messageRepository.save(message);
            
            // Update session activity
            sessionService.updateLastActivity(request.getSessionId());
            
            // Get partner session ID
            UUID partnerSessionId = chatRoomService.getPartnerSessionId(
                    request.getRoomId(), 
                    request.getSessionId()
            );
            
            // Create response
            ChatMessageResponse response = ChatMessageResponse.builder()
                    .messageId(savedMessage.getId())
                    .fromSessionId(savedMessage.getFromSessionId())
                    .content(savedMessage.getContent())
                    .timestamp(savedMessage.getTimestamp())
                    .isAI(false)
                    .build();
            
            // Send to both participants
            messagingTemplate.convertAndSend("/queue/messages/" + request.getSessionId(), response);
            messagingTemplate.convertAndSend("/queue/messages/" + partnerSessionId, response);
            
            log.info("Message sent in room {}: {}", request.getRoomId(), savedMessage.getId());
            
        } catch (Exception e) {
            log.error("Error sending message", e);
        }
    }
    
    @MessageMapping("/chat.disconnect")
    public void disconnect(@Payload UUID sessionId) {
        try {
            UUID roomId = matchmakingService.getRoomIdForSession(sessionId);
            
            if (roomId != null) {
                chatRoomService.closeChatRoom(roomId, sessionId);
                matchmakingService.removeSessionFromRoom(sessionId);
                sessionService.updateSessionStatus(sessionId, 
                        hu.bme.mit.randomchat.model.Session.SessionStatus.DISCONNECTED);
                
                log.info("Session {} disconnected from room {}", sessionId, roomId);
            }
            
        } catch (Exception e) {
            log.error("Error handling disconnect", e);
        }
    }
}
