package com.ms.notification.config;

import java.io.IOException;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import io.nats.client.Connection;
import io.nats.client.ErrorListener;
import io.nats.client.Nats;
import io.nats.client.Options;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
public class NatsConfig {

    @Value("${NATS_URL:nats://nats:4222}")
    private String URL;

    private final long CONNECTION_TIMEOUT = 5000;

    private final int MAX_RECONNECT = 10;

    private final long RECONNECT_WAIT = 2000;
    
    //Configure NATS Configuration
    @Bean
    Connection natsConnection() throws IOException, InterruptedException {
        log.info("Configuring NATS connection to: {}", URL);
        
        Options options = new Options.Builder()
                .server(URL)
                .connectionTimeout(Duration.ofMillis(CONNECTION_TIMEOUT))
                .maxReconnects(MAX_RECONNECT)
                .reconnectWait(Duration.ofMillis(RECONNECT_WAIT))
                .errorListener(new ErrorListener() {
                    @Override
                    public void errorOccurred(Connection conn, String error) {
                        log.error("NATS connection error: {}", error);
                    }

                    @Override
                    public void exceptionOccurred(Connection conn, Exception exp) {
                        log.error("NATS connection exception: ", exp);
                    }

                    @Override
                    public void slowConsumerDetected(Connection conn, io.nats.client.Consumer consumer) {
                        log.warn("NATS slow consumer detected");
                    }
                })
                .build();
        Connection connection = Nats.connect(options);
        log.info("NATS connection established successfully");
        return connection;
    }


    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        // Register JavaTimeModule for Java 8 date/time types
        mapper.registerModule(new JavaTimeModule());
        
        // Disable writing dates as timestamps
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        // Pretty print JSON (optional, can be disabled in production)
        mapper.enable(SerializationFeature.INDENT_OUTPUT);
        
        log.info("ObjectMapper configured successfully");
        
        return mapper;
    }
}
