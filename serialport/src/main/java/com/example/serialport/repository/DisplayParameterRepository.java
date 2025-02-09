package com.example.serialport.repository;

import com.example.serialport.model.DisplayParameterEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisplayParameterRepository extends MongoRepository<DisplayParameterEntity, String> {
    List<DisplayParameterEntity> findAll();
}
