package com.example.serialport.model;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;
@Data
@Document(collection = "test_results")
public class TestResults {
    @Id
    private String id;
    private String websiteUrl;
    private Date testDate;
    private List<TestStep> steps;
    private String textFileReference;

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getWebsiteUrl() {
        return websiteUrl;
    }

    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }

    public Date getTestDate() {
        return testDate;
    }

    public void setTestDate(Date testDate) {
        this.testDate = testDate;
    }

    public List<TestStep> getSteps() {
        return steps;
    }

    public void setSteps(List<TestStep> steps) {
        this.steps = steps;
    }

    public String getTextFileReference() {
        return textFileReference;
    }

    public void setTextFileReference(String textFileReference) {
        this.textFileReference = textFileReference;
    }
}
