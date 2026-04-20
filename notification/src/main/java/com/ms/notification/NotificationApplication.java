package com.ms.notification;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.ms.notification.dto.CreateTemplateDto;
import com.ms.notification.entity.enums.TypeNotification;
import com.ms.notification.service.TemplateService;

@SpringBootApplication
@EnableScheduling
public class NotificationApplication {

	@Bean
	CommandLineRunner initDatabase(TemplateService templateService) {
		return args -> {
			if (templateService.getTemplates().stream().noneMatch(t -> List.of(TypeNotification.values()).stream()
			.anyMatch(type -> t.getType().equals(type)))
			) {
				CreateTemplateDto templateDto = new CreateTemplateDto(TypeNotification.SHAREFILE, "Sharing request");
				CreateTemplateDto template = new CreateTemplateDto(TypeNotification.REMINDER_EXPIRATION, "Reminder of expiration of right of access to file");
				CreateTemplateDto templateDto2 = new CreateTemplateDto(TypeNotification.JOINGROUP, "Request to join a group ");
				CreateTemplateDto templateDto3 = new CreateTemplateDto(TypeNotification.ACCESSFILE, "Request for access to the file");
				CreateTemplateDto templateDtoConfirm = new CreateTemplateDto(TypeNotification.CONFIRM_ACCOUNT, "Confirm account");
				CreateTemplateDto templateDtoRequest = new CreateTemplateDto(TypeNotification.REQUEST_FILE, "Request of file");
				CreateTemplateDto templateDtoImport = new CreateTemplateDto(TypeNotification.IMPORT_FILE, "Import of file");

				templateService.createTemplate(templateDto);
				templateService.createTemplate(template);
				templateService.createTemplate(templateDto2);
				templateService.createTemplate(templateDto3);
				templateService.createTemplate(templateDtoConfirm);
				templateService.createTemplate(templateDtoImport);
				templateService.createTemplate(templateDtoRequest);
			}	
		};
	}

	public static void main(String[] args) {
		SpringApplication.run(NotificationApplication.class, args);
	}

}
