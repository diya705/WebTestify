package com.example.serialport.repository;

import com.example.serialport.model.ContactRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ContactRequestRepository extends MongoRepository<ContactRequest, String> {
}
