package com.example.serialport.model;

import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "display_parameters")
public class DisplayParameterEntity {
    private String startPosition;
    private int length;
    private String dataType;
    private String value;

    public DisplayParameterEntity() {
    }

    public DisplayParameterEntity(String startPosition, int length, String dataType, String value) {
        this.startPosition = startPosition;
        this.length = length;
        this.dataType = dataType;
        this.value = value;
    }

    public String getStartPosition() {
        return startPosition;
    }

    public void setStartPosition(String startPosition) {
        this.startPosition = startPosition;
    }

    public int getLength() {
        return length;
    }

    public void setLength(int length) {
        this.length = length;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
