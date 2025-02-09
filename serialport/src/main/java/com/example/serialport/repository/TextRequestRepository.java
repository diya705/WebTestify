package com.example.serialport.repository;

import com.example.serialport.model.TextRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TextRequestRepository extends MongoRepository<TextRequest, String> {
}
