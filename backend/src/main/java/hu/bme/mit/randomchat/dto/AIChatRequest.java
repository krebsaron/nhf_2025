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
public class AIChatRequest {
    
    @NotNull(message = "Session ID is required")
    private UUID sessionId;
    
    @NotBlank(message = "Message cannot be empty")
    @Size(max = 1000, message = "Message too long")
    private String message;
}
