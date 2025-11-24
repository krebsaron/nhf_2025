package hu.bme.mit.randomchat.service;

import hu.bme.mit.randomchat.model.ChatRoom;
import hu.bme.mit.randomchat.model.Message;
import hu.bme.mit.randomchat.repository.ChatRoomRepository;
import hu.bme.mit.randomchat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatRoomService {
    
    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    @Transactional
    public ChatRoom createChatRoom(UUID session1Id, UUID session2Id) {
        ChatRoom chatRoom = ChatRoom.builder()
                .session1Id(session1Id)
                .session2Id(session2Id)
                .active(true)
                .build();
        
        ChatRoom savedRoom = chatRoomRepository.save(chatRoom);
        log.info("Created chat room: {}", savedRoom.getId());
        return savedRoom;
    }
    
    public ChatRoom getChatRoom(UUID roomId) {
        return chatRoomRepository.findByIdAndActiveTrue(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found or inactive: " + roomId));
    }
    
    @Transactional
    public void closeChatRoom(UUID roomId, UUID initiatorSessionId) {
        ChatRoom chatRoom = getChatRoom(roomId);
        
        chatRoom.setActive(false);
        chatRoom.setClosedAt(LocalDateTime.now());
        chatRoomRepository.save(chatRoom);
        
        // Get partner session ID
        UUID partnerSessionId = chatRoom.getSession1Id().equals(initiatorSessionId) 
                ? chatRoom.getSession2Id() 
                : chatRoom.getSession1Id();
        
        // Notify partner about disconnect
        messagingTemplate.convertAndSend("/queue/disconnect/" + partnerSessionId, 
                "Partner has left the chat");
        
        // Delete all messages
        messageRepository.deleteByRoomId(roomId);
        
        log.info("Closed chat room: {}", roomId);
    }
    
    public UUID getPartnerSessionId(UUID roomId, UUID sessionId) {
        ChatRoom chatRoom = getChatRoom(roomId);
        return chatRoom.getSession1Id().equals(sessionId) 
                ? chatRoom.getSession2Id() 
                : chatRoom.getSession1Id();
    }
    
    public boolean isSessionInRoom(UUID roomId, UUID sessionId) {
        ChatRoom chatRoom = getChatRoom(roomId);
        return chatRoom.getSession1Id().equals(sessionId) || 
               chatRoom.getSession2Id().equals(sessionId);
    }
}
