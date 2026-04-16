export interface NotificationResponse {
  recipientId: number;

  recipientType: string;

  templateId: number;

  type: string;

  typeChannel: string;

  metadata: Record<string, unknown>;
}
