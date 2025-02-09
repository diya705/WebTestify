package com.example.serialport.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "text_requests")
public class TextRequest {
    @Id
    private String id;
    private String text;

    public TextRequest() {}
    public TextRequest(String text){
        this.text = text;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
