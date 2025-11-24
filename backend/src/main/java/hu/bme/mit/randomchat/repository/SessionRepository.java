package hu.bme.mit.randomchat.repository;

import hu.bme.mit.randomchat.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SessionRepository extends JpaRepository<Session, UUID> {
    
    List<Session> findByStatus(Session.SessionStatus status);
    
    List<Session> findByLastActivityAtBefore(LocalDateTime dateTime);
}
