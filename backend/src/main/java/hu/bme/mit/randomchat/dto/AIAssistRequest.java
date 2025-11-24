package hu.bme.mit.randomchat.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIAssistRequest {
    
    @Size(max = 500, message = "Prompt too long")
    private String prompt;
    
    @Size(max = 1000, message = "Text too long")
    private String text;
}
