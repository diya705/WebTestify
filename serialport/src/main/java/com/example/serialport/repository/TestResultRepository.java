package com.example.serialport.repository;
import com.example.serialport.model.TestResults;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface TestResultRepository extends MongoRepository<TestResults, String>{
}
