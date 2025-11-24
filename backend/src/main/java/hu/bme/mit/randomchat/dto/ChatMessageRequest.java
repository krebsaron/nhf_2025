package hu.bme.mit.randomchat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequest {
    
    @NotNull(message = "Room ID is required")
    private UUID roomId;
    
    @NotNull(message = "Session ID is required")
    private UUID sessionId;
    
    @NotBlank(message = "Message content cannot be empty")
    @Size(max = 2000, message = "Message too long (max 2000 characters)")
    private String content;
}
