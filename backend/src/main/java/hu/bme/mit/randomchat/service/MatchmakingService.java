package hu.bme.mit.randomchat.service;

import hu.bme.mit.randomchat.dto.MatchResponse;
import hu.bme.mit.randomchat.model.ChatRoom;
import hu.bme.mit.randomchat.model.Session;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchmakingService {
    
    private final SessionService sessionService;
    private final ChatRoomService chatRoomService;
    private final AIConversationService aiConversationService;
    private final SimpMessagingTemplate messagingTemplate;
    
    private final ConcurrentLinkedQueue<UUID> waitingQueue = new ConcurrentLinkedQueue<>();
    private final Map<UUID, UUID> sessionToRoomMap = new ConcurrentHashMap<>();
    
    @Transactional
    public void joinLobby(UUID sessionId) {
        Session session = sessionService.getSession(sessionId);
        
        if (session.getStatus() != Session.SessionStatus.WAITING) {
            log.warn("Session {} is not in WAITING status", sessionId);
            return;
        }
        
        log.info("Session {} joined lobby", sessionId);
        sessionService.updateSessionStatus(sessionId, Session.SessionStatus.WAITING);
        
        // Add to queue first
        waitingQueue.offer(sessionId);
        log.info("Session {} added to queue. Queue size: {}", sessionId, waitingQueue.size());
        
        // Schedule matching attempt after a delay to allow WebSocket subscriptions
        new Thread(() -> {
            try {
                Thread.sleep(1000); // 1 second delay
                tryMatchFromQueue();
            } catch (InterruptedException e) {
                log.error("Matching thread interrupted", e);
            }
        }).start();
    }
    
    private void tryMatchFromQueue() {
        // Try to create a match if we have at least 2 sessions waiting
        if (waitingQueue.size() >= 2) {
            UUID session1Id = waitingQueue.poll();
            UUID session2Id = waitingQueue.poll();
            
            if (session1Id != null && session2Id != null) {
                log.info("Attempting to match sessions: {} and {}", session1Id, session2Id);
                createMatch(session1Id, session2Id);
            }
        }
    }
    
    private void tryMatch(UUID newSessionId) {
        // Add to queue
        waitingQueue.offer(newSessionId);
        
        // Try to create a match
        if (waitingQueue.size() >= 2) {
            UUID session1Id = waitingQueue.poll();
            UUID session2Id = waitingQueue.poll();
            
            if (session1Id != null && session2Id != null) {
                createMatch(session1Id, session2Id);
            }
        }
    }
    
    @Transactional
    public void createMatch(UUID session1Id, UUID session2Id) {
        try {
            // Create chat room
            ChatRoom chatRoom = chatRoomService.createChatRoom(session1Id, session2Id);
            
            // Update session statuses
            sessionService.updateSessionStatus(session1Id, Session.SessionStatus.MATCHED);
            sessionService.updateSessionStatus(session2Id, Session.SessionStatus.MATCHED);
            
            // Store room mapping
            sessionToRoomMap.put(session1Id, chatRoom.getId());
            sessionToRoomMap.put(session2Id, chatRoom.getId());
            
            // Delete AI conversations from lobby
            aiConversationService.deleteConversation(session1Id);
            aiConversationService.deleteConversation(session2Id);
            
            // Notify both sessions
            MatchResponse response1 = MatchResponse.builder()
                    .roomId(chatRoom.getId())
                    .partnerSessionId(session2Id)
                    .build();
            
            MatchResponse response2 = MatchResponse.builder()
                    .roomId(chatRoom.getId())
                    .partnerSessionId(session1Id)
                    .build();
            
            messagingTemplate.convertAndSend("/queue/match/" + session1Id, response1);
            messagingTemplate.convertAndSend("/queue/match/" + session2Id, response2);
            
            log.info("Created match: room={}, session1={}, session2={}", 
                    chatRoom.getId(), session1Id, session2Id);
            
        } catch (Exception e) {
            log.error("Error creating match", e);
            // Put sessions back in queue
            waitingQueue.offer(session1Id);
            waitingQueue.offer(session2Id);
        }
    }
    
    public void leaveLobby(UUID sessionId) {
        waitingQueue.remove(sessionId);
        log.info("Session {} left lobby", sessionId);
    }
    
    public UUID getRoomIdForSession(UUID sessionId) {
        return sessionToRoomMap.get(sessionId);
    }
    
    public void removeSessionFromRoom(UUID sessionId) {
        sessionToRoomMap.remove(sessionId);
    }
}
