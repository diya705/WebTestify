package com.example.serialport.repository;

import com.example.serialport.model.OutputRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface OutputRequestRepository extends MongoRepository<OutputRequest, String> {

}
