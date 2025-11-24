package hu.bme.mit.randomchat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RandomChatApplication {
    public static void main(String[] args) {
        SpringApplication.run(RandomChatApplication.class, args);
    }
}
