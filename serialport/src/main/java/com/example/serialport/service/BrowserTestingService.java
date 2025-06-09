package com.example.serialport.service;

import com.example.serialport.model.TestAction;
import com.example.serialport.model.TestResults;
import com.example.serialport.model.TestStep;
import com.example.serialport.repository.TestResultRepository;
import org.apache.commons.io.FileUtils;
import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.*;

@Service
public class BrowserTestingService {
    @Autowired
    private WebDriver driver;

    @Autowired
    private TestResultRepository testResultRepository;

    @Value("${screenshots.dir:screenshots}")
    private String screenshotsDir;

    @Value("${test.results.dir:test_results}")
    private String testResultsDir;

    public TestResults testWebsite(String url, List<TestAction> actions) throws IOException {
        createDirectories();

        TestResults result = new TestResults();
        result.setWebsiteUrl(url);
        result.setTestDate(new Date());

        List<TestStep> steps = new ArrayList<>();

        try {
            driver.get(url);

            for (TestAction action : actions) {
                TestStep step = executeAction(action);
                steps.add(step);
            }
        } finally {
            result.setSteps(steps);
            String textFilePath = generateTextFile(result);
            result.setTextFileReference(textFilePath);
            testResultRepository.save(result);
        }

        return result;
    }

    private TestStep executeAction(TestAction action) {
        TestStep step = new TestStep();
        step.setAction(action.getActionType());
        step.setInput(action.getInputValue());
        step.setTimestamp(new Date());

        try {
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
            WebElement element = wait.until(
                    ExpectedConditions.presenceOfElementLocated(By.cssSelector(action.getElementSelector()))
            );

            performAction(action, step, element);
            step.setScreenshotPath(takeScreenshot());
        } catch (Exception e) {
            step.setOutput("Error: " + e.getMessage());
        }

        return step;
    }

    private void performAction(TestAction action, TestStep step, WebElement element) {
        switch(action.getActionType().toUpperCase()) {
            case "CLICK":
                element.click();
                step.setOutput("Element clicked successfully");
                break;
            case "INPUT":
                element.clear();
                element.sendKeys(action.getInputValue());
                step.setOutput("Text entered successfully: " + action.getInputValue());
                break;
            case "NAVIGATE":
                driver.get(action.getInputValue());
                step.setOutput("Navigated to: " + action.getInputValue());
                break;
            case "VERIFY_URL":
                new WebDriverWait(driver, Duration.ofSeconds(10))
                        .until(ExpectedConditions.urlToBe(action.getInputValue()));
                step.setOutput("Successfully navigated to: " + action.getInputValue());
                break;
            default:
                step.setOutput("Unknown action type: " + action.getActionType());
        }
    }

    private String takeScreenshot() throws IOException {
        File screenshot = ((TakesScreenshot)driver).getScreenshotAs(OutputType.FILE);
        String filename = UUID.randomUUID() + ".png";
        String path = screenshotsDir + "/" + filename;
        FileUtils.copyFile(screenshot, new File(path));
        return path;
    }

    private String generateTextFile(TestResults result) throws IOException {
        String filename = result.getId() + ".txt";
        String path = testResultsDir + "/" + filename;

        try (PrintWriter writer = new PrintWriter(path)) {
            writer.println("Website Test Report");
            writer.println("===================");
            writer.println();
            writer.println("Website URL: " + result.getWebsiteUrl());
            writer.println("Test Date: " + result.getTestDate());
            writer.println();
            writer.println("Test Steps:");
            writer.println("-----------");

            for (int i = 0; i < result.getSteps().size(); i++) {
                TestStep step = result.getSteps().get(i);
                writer.println();
                writer.println("Step " + (i + 1) + ":");
                writer.println("  Action: " + step.getAction());
                writer.println("  Element: " + step.getInput());
                writer.println("  Output: " + step.getOutput());
                writer.println("  Timestamp: " + step.getTimestamp());
                writer.println("  Screenshot: " + step.getScreenshotPath());
            }
        }

        return path;
    }

    public TestResults getTestResult(String id) {
        return testResultRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test result not found with id: " + id));
    }

    public List<TestResults> getAllResults() {
        return testResultRepository.findAll();
    }

    private void createDirectories() {
        new File(screenshotsDir).mkdirs();
        new File(testResultsDir).mkdirs();
    }
}
