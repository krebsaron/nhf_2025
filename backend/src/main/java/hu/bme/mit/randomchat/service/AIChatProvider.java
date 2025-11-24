package hu.bme.mit.randomchat.service;

import java.util.List;
import java.util.Map;

public interface AIChatProvider {

    String chatCompletion(List<Map<String, String>> messages);

    String generateAssistance(String prompt, String text);
}
