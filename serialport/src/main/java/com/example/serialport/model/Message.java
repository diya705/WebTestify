package com.example.serialport.model;

import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "messages")
public class Message {
    private String content;
    private String message;

    public Message() {
    }

    public Message(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
    public String getContent() {
        return this.content;
    }

}
