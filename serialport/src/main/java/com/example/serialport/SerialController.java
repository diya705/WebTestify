package com.example.serialport;

import com.example.serialport.model.*;
import com.example.serialport.repository.*;

import com.fazecast.jSerialComm.SerialPort;
import com.google.protobuf.InvalidProtocolBufferException;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;

import com.example.serialport.model.TestAction;
import com.example.serialport.model.TestResults;
import com.example.serialport.service.BrowserTestingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SerialController {
    private static final Logger log = LoggerFactory.getLogger(SerialController.class);

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private DisplayParameterRepository displayParameterRepository;

    @Autowired
    private TextRequestRepository textRequestRepository;

    @Autowired
    private OutputRequestRepository outputRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContactRequestRepository contactRequestRepository;

    @Autowired
    private Environment env;

    @Autowired
    private BrowserTestingService testingService;

    @Value("${serial.port}")
    private String serialPortName;

    @Value("${serial.baudRate}")
    private int serialBaudRate;

    @Value("${serial.numDataBits}")
    private int serialNumDataBits;

    @Value("${mail.sender}")
    private String mailSenderEmail;

    @Value("${mail.recipient}")
    private String mailRecipientEmail;

    @Value("${message.prefix}")
    private String messagePrefix;

    @Value("${packet.prefix}")
    private String packetPrefix;

    @Value("${signal.reset.prefix}")
    private String signalResetPrefix;

    @PostMapping("/sendMessages")
    public String sendMessages(@RequestBody byte[] data) throws InvalidProtocolBufferException {
        if (data == null || data.length == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid request data");
        }
        MessageProto.SerialMessage serialMessage = MessageProto.SerialMessage.parseFrom(data);
        SerialPort serialPort = SerialPort.getCommPort(serialPortName);
        serialPort.setBaudRate(serialBaudRate);
        serialPort.setNumDataBits(serialNumDataBits);
        serialPort.setParity(SerialPort.NO_PARITY);
        serialPort.setNumStopBits(SerialPort.ONE_STOP_BIT);
        serialPort.setFlowControl(SerialPort.FLOW_CONTROL_DISABLED);

        if (serialPort.openPort()) {
            try {
                for (String message : serialMessage.getMessagesList()) {
                    if (message.startsWith(messagePrefix)) {
                        // Handle screen change message
                        handleScreenChangeMessage(message, serialPort);
                    } else {
                        // Handle other messages
                        byte[] messageBytes = hexStringToByteArray(message);
                        serialPort.writeBytes(messageBytes, messageBytes.length);
                    }
                }
                
                for (MessageProto.DisplayParameter displayParameter : serialMessage.getDisplayParametersList()) {
                    String startPosition = displayParameter.getStartPosition();
                    int length = displayParameter.getLength();
                    String dataType = displayParameter.getDataType();
                    String value = displayParameter.getValue();

                    String packet = generatePacket(startPosition, length, dataType, value);
                    byte[] packetBytes = hexStringToByteArray(packet);
                    serialPort.writeBytes(packetBytes, packetBytes.length);
                }
                // Store the messages in the database
                List<Message> messages = new ArrayList<>();
                for (String message : serialMessage.getMessagesList()) {
                    messages.add(new Message(message));
                }
                messageRepository.saveAll(messages);

                // Store the display parameters in the database
                List<DisplayParameterEntity> displayParameters = new ArrayList<>();
                for (MessageProto.DisplayParameter displayParameter : serialMessage.getDisplayParametersList()) {
                    displayParameters.add(new DisplayParameterEntity(displayParameter.getStartPosition(),
                            displayParameter.getLength(), displayParameter.getDataType(), displayParameter.getValue()));
                }
                displayParameterRepository.saveAll(displayParameters); // Use the correct repository
                return "Messages sent successfully!";
            } finally {
                serialPort.closePort();
            }
        } else {
            return "Failed to open serial port!";
        }
    }

    @PostMapping("/process")
    public String processText(@RequestBody TextRequest request) {
        String receivedText = request.getText();
        System.out.println("Received text:" + receivedText);
        textRequestRepository.save(request);

        String processedText = "Processed text:" + receivedText;
        System.out.println(processedText);

        return processedText;
    }

    @PostMapping("/output")
    public String outputText(@RequestBody OutputRequest request) {
        outputRequestRepository.save(request);
        return request.getText();
    }

    @GetMapping("/history/process")
    public List<TextRequest> getTextRequestHistory() {
        return textRequestRepository.findAll();
    }

    @GetMapping("/history/output")
    public List<OutputRequest> getOutputRequestHistory() {
        return outputRequestRepository.findAll();
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest registerRequest) {
        User user = new User(registerRequest.getName(), registerRequest.getEmail(), registerRequest.getUsername(), registerRequest.getPassword());
        userRepository.save(user);
        return "Registration successful";
    }

    @RequestMapping("/login")
    public String login(@RequestBody User user) {
        System.out.println("Login request received for user: " + user.getUsername());
        Optional<User> existingUserOptional = userRepository.findByUsername(user.getUsername());
        if (existingUserOptional.isPresent()) {
            User existingUser = existingUserOptional.get();
            if (existingUser.getPassword().equals(user.getPassword())) {
                System.out.println("Login successful for user: " + user.getUsername());
                return "Login successful";
            } else {
                System.out.println("Invalid password for user: " + user.getUsername());
                return "Invalid password";
            }
        } else {
            System.out.println("User not found: " + user.getUsername());
            return "User not found";
        }
    }

    @PostMapping("/contact")
    public String submitContactForm(@RequestBody ContactRequest contactRequest) {
        contactRequestRepository.save(contactRequest);
        return "Your message has been sent successfully!";
    }

    @Scheduled(fixedRate = 3600000) // Run every hour
    public void sendReportEmail() throws DocumentException, MessagingException {
        List<Message> messages = messageRepository.findAll();
        List<DisplayParameterEntity> displayParameters = displayParameterRepository.findAll();

        StringBuilder reportContent = new StringBuilder();
        reportContent.append("<h1>Testing Report</h1>");
        reportContent.append("<h2>Messages:</h2>");
        reportContent.append("<ul>");
        for (Message message : messages) {
            reportContent.append("<li>").append(message.getContent()).append("</li>");
        }
        reportContent.append("</ul>");

        reportContent.append("<h2>Display Parameters:</h2>");
        reportContent.append("<ul>");
        for (DisplayParameterEntity parameter : displayParameters) {
            reportContent.append("<li>")
                    .append("Start Position: ").append(parameter.getStartPosition()).append(", ")
                    .append("Length: ").append(parameter.getLength()).append(", ")
                    .append("Data Type: ").append(parameter.getDataType()).append(", ")
                    .append("Value: ").append(parameter.getValue())
                    .append("</li>");
        }
        reportContent.append("</ul>");
        // Generate a PDF report
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter writer = PdfWriter.getInstance(document, bos);
        document.open();
        document.add(new Paragraph(reportContent.toString()));
        document.close();

        // Create the email message
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);

        // Add the file attachment
        helper.addAttachment("report.pdf", new ByteArrayResource(bos.toByteArray()));

        // Set the email subject and body
        helper.setSubject("Testing Report");
        helper.setText(reportContent.toString());

        // Add debug logs to inspect the email message contents
        log.debug("Email message contents:");
        log.debug("Subject: {}", mimeMessage.getSubject());
        log.debug("Body: {}", reportContent.toString());
        log.debug("Attachments: {}", Arrays.asList("report.pdf"));

        // Send the email
        mailSender.send(mimeMessage);
        log.info("Email sent successfully!");
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailSenderEmail); // Use the email from configuration
            message.setTo(mailRecipientEmail); // Use the recipient email from configuration
            message.setSubject("Testing Report");
            message.setText(reportContent.toString());

            mailSender.send(message);
            log.info("Email sent successfully!");
        } catch (MailException e) {
            log.error("Error sending email", e);
            // Rethrow the exception or provide a more user-friendly error message
            throw new RuntimeException("Error sending email", e);
        } catch (Exception e) {
            log.error("Unexpected error sending email", e);
            // Rethrow the exception or provide a more user-friendly error message
            throw new RuntimeException("Unexpected error sending email", e);
        }
    }


    
    private String generatePacket(String startPosition, int length, String dataType, String value) {
        String packet = packetPrefix;
        int packetLength = 1 + 2 + length; // 1 byte for write command, 2 bytes for start position, and length bytes for value
        packet += String.format("%02X", packetLength);
        packet += "82";
        packet += startPosition;
        if (dataType.equals("signed")) {
            int intValue = Integer.parseInt(value);
            if (length == 2) {
                packet += String.format("%04X", intValue);
            } else if (length == 4) {
                packet += String.format("%08X", intValue);
            }
        } else if (dataType.equals("unsigned")) {
            int intValue = Integer.parseInt(value);
            if (length == 2) {
                packet += String.format("%04X", intValue & 0xFFFF);
            } else if (length == 4) {
                packet += String.format("%08X", intValue & 0xFFFFFFFF);
            }
        } else if (dataType.equals("string")) {
            packet += value;
        }
        packet += "0A";
        return packet;
    }
    private void handleScreenChangeMessage(String message, SerialPort serialPort) {
        // Extract the screen number from the message
        String screenNumberHex = message.substring(12);
        int screenNumber = Integer.parseInt(screenNumberHex, 16);

        // Reset the signals command
        for (int i = 1; i <= 31; i++) {
            String signalResetMessage = signalResetPrefix + String.format("%02X", i) + "0000";
            serialPort.writeBytes(hexStringToByteArray(signalResetMessage), signalResetMessage.length() / 2);
        }

        // Reset the display parameters command
        List<DisplayParameterEntity> displayParameters = displayParameterRepository.findAll();
        for (DisplayParameterEntity displayParameter : displayParameters) {
            String startPosition = displayParameter.getStartPosition();
            int length = displayParameter.getLength();
            String dataType = displayParameter.getDataType();
            String value = "0";

            String packet = generatePacket(startPosition, length, dataType, value);
            byte[] packetBytes = hexStringToByteArray(packet);
            serialPort.writeBytes(packetBytes, packetBytes.length);
        }
        // Update the serial port accordingly
        byte[] messageBytes = hexStringToByteArray(message);
        serialPort.writeBytes(messageBytes, messageBytes.length);

        // Close the serial port to reset its parameters
        serialPort.closePort();

        // Reopen the serial port with default settings
        if (serialPort.openPort()) {
            serialPort.setBaudRate(serialBaudRate);
            serialPort.setNumDataBits(serialNumDataBits);
            serialPort.setParity(SerialPort.NO_PARITY);
            serialPort.setNumStopBits(SerialPort.ONE_STOP_BIT);
            serialPort.setFlowControl(SerialPort.FLOW_CONTROL_DISABLED);
        } else {
            System.out.println("Failed to reopen serial port!");
        }

        // Log the screen change message
        System.out.println("Screen change message sent: " + message);
    }
    private byte[] hexStringToByteArray(String hexString) {
        int len = hexString.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hexString.charAt(i), 16) << 4)
                    + Character.digit(hexString.charAt(i + 1), 16));
        }
        return data;
    }

    @PostMapping("/run")
    public ResponseEntity<TestResults> runTest(@RequestBody TestRequest request) throws Exception {
        TestResults result = testingService.testWebsite(request.getUrl(), request.getActions());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/results")
    public ResponseEntity<List<TestResults>> getAllResults() {
        return ResponseEntity.ok(testingService.getAllResults());
    }

    @GetMapping("/results/{id}/textfile")
    public ResponseEntity<Resource> getTextFile(@PathVariable String id) throws Exception {
        TestResults result = testingService.getTestResult(id);
        Path path = Paths.get(result.getTextFileReference());
        Resource resource = new UrlResource(path.toUri());

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_PLAIN)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    public static class TestRequest {
        private String url;
        private List<TestAction> actions;

        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        public List<TestAction> getActions() { return actions; }
        public void setActions(List<TestAction> actions) { this.actions = actions; }
    }
}