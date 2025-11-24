package hu.bme.mit.randomchat.repository;

import hu.bme.mit.randomchat.model.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, UUID> {
    
    Optional<ChatRoom> findByIdAndActiveTrue(UUID id);
    
    Optional<ChatRoom> findBySession1IdOrSession2Id(UUID session1Id, UUID session2Id);
}
