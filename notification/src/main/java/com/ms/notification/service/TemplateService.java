package com.ms.notification.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ms.notification.dto.CreateTemplateDto;
import com.ms.notification.entity.Template;
import com.ms.notification.entity.enums.TypeNotification;
import com.ms.notification.exceptions.TemplateNotFoundException;
import com.ms.notification.repositories.TemplateRepository;

@Service
public class TemplateService {
    @Autowired
    private TemplateRepository repository;

    public Template createTemplate(CreateTemplateDto templateDto) {
        Template template = new Template(templateDto.getType(), templateDto.getMessage());
        repository.save(template);
        return template;
    }

    public Template getTemplateByType(TypeNotification type) {
        Optional<Template> optional = repository.findTemplateByType(type);
        if (!optional.isPresent()) {
            throw new TemplateNotFoundException();
        } else {
            return optional.get();
        }
    }

    public List<Template> getTemplates() {
        return repository.findAll();
    }

}
