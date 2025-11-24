package hu.bme.mit.randomchat.service;

import hu.bme.mit.randomchat.model.Session;
import hu.bme.mit.randomchat.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionService {
    
    private final SessionRepository sessionRepository;
    
    @Value("${session.timeout.minutes:30}")
    private int sessionTimeoutMinutes;
    
    @Transactional
    public Session createSession() {
        Session session = Session.builder()
                .status(Session.SessionStatus.WAITING)
                .lastActivityAt(LocalDateTime.now())
                .build();
        
        Session savedSession = sessionRepository.save(session);
        log.info("Created new session: {}", savedSession.getId());
        return savedSession;
    }
    
    @Transactional
    public void updateSessionStatus(UUID sessionId, Session.SessionStatus status) {
        sessionRepository.findById(sessionId).ifPresent(session -> {
            session.setStatus(status);
            session.setLastActivityAt(LocalDateTime.now());
            sessionRepository.save(session);
            log.info("Updated session {} status to {}", sessionId, status);
        });
    }
    
    @Transactional
    public void updateLastActivity(UUID sessionId) {
        sessionRepository.findById(sessionId).ifPresent(session -> {
            session.setLastActivityAt(LocalDateTime.now());
            sessionRepository.save(session);
        });
    }
    
    public Session getSession(UUID sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));
    }
    
    @Scheduled(fixedDelay = 60000) // Run every minute
    @Transactional
    public void cleanupInactiveSessions() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(sessionTimeoutMinutes);
        List<Session> inactiveSessions = sessionRepository.findByLastActivityAtBefore(cutoffTime);
        
        if (!inactiveSessions.isEmpty()) {
            log.info("Cleaning up {} inactive sessions", inactiveSessions.size());
            sessionRepository.deleteAll(inactiveSessions);
        }
    }
    
    @Transactional
    public void deleteSession(UUID sessionId) {
        sessionRepository.deleteById(sessionId);
        log.info("Deleted session: {}", sessionId);
    }
}
