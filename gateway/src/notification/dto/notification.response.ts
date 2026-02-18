export interface NotificationResponse {
    recipientId: number;
    
    recipientType: string;

    templateId: number;

    type: string;

    message: string;

    typeChannel: string;

    metadata: Record<string, any>;
}