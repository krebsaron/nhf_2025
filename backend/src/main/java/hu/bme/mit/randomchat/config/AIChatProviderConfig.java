package hu.bme.mit.randomchat.config;

import hu.bme.mit.randomchat.service.AIChatProvider;
import hu.bme.mit.randomchat.service.GoogleAIService;
import hu.bme.mit.randomchat.service.OpenAIService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
@RequiredArgsConstructor
public class AIChatProviderConfig {

    @Value("${ai.provider:openai}")
    private String aiProvider;

    private final OpenAIService openAIService;
    private final GoogleAIService googleAIService;

    @Bean
    @Primary
    public AIChatProvider aiChatProvider() {
        return switch (aiProvider.toLowerCase()) {
            case "google" -> googleAIService;
            case "openai" -> openAIService;
            default -> {
                org.slf4j.LoggerFactory.getLogger(AIChatProviderConfig.class)
                        .warn("Unknown AI provider: {}. Defaulting to OpenAI.", aiProvider);
                yield openAIService;
            }
        };
    }
}
