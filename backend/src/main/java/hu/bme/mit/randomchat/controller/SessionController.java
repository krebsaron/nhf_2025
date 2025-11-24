package hu.bme.mit.randomchat.controller;

import hu.bme.mit.randomchat.dto.SessionResponse;
import hu.bme.mit.randomchat.model.Session;
import hu.bme.mit.randomchat.service.MatchmakingService;
import hu.bme.mit.randomchat.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/session")
@RequiredArgsConstructor
@Slf4j
public class SessionController {
    
    private final SessionService sessionService;
    private final MatchmakingService matchmakingService;
    
    @PostMapping("/create")
    public ResponseEntity<SessionResponse> createSession() {
        Session session = sessionService.createSession();
        
        SessionResponse response = SessionResponse.builder()
                .sessionId(session.getId())
                .status(session.getStatus().name())
                .build();
        
        log.info("Created session: {}", session.getId());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/join-lobby/{sessionId}")
    public ResponseEntity<Void> joinLobby(@PathVariable UUID sessionId) {
        matchmakingService.joinLobby(sessionId);
        log.info("Session {} joined lobby", sessionId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/{sessionId}")
    public ResponseEntity<SessionResponse> getSession(@PathVariable UUID sessionId) {
        Session session = sessionService.getSession(sessionId);
        
        SessionResponse response = SessionResponse.builder()
                .sessionId(session.getId())
                .status(session.getStatus().name())
                .build();
        
        return ResponseEntity.ok(response);
    }
}
