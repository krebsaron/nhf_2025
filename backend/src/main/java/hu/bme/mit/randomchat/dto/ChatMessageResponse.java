package hu.bme.mit.randomchat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageResponse {
    private UUID messageId;
    private UUID fromSessionId;
    private String content;
    private LocalDateTime timestamp;
    private Boolean isAI;
}
