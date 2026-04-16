export interface ShareReceiverUser {
  id: number;
  email: string;
}

export interface ShareReceiverGroup {
  id: number;
  name: string;
}

export interface ReceiversResponse {
  users: ShareReceiverUser[];
  groups: ShareReceiverGroup[];
}
