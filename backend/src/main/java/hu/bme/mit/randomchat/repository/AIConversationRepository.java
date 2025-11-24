package hu.bme.mit.randomchat.repository;

import hu.bme.mit.randomchat.model.AIConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AIConversationRepository extends JpaRepository<AIConversation, UUID> {
    
    Optional<AIConversation> findBySessionId(UUID sessionId);
    
    void deleteBySessionId(UUID sessionId);
}
