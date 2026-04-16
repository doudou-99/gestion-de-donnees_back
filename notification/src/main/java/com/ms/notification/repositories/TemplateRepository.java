package com.ms.notification.repositories;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.ms.notification.entity.Template;
import com.ms.notification.entity.enums.TypeNotification;

@Repository
public interface TemplateRepository extends MongoRepository<Template, String>{
    Optional<Template> findTemplateByType(TypeNotification type);
}
