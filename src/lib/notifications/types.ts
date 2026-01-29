
export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  email?: {
    to: string;
    from?: string; // Optional custom sender email
    subject?: string;
    html?: string;
    text?: string;
    attachments?: { filename: string; content: Buffer | string; contentType?: string }[];
  };
  push?: {
    tokens?: string[];
    topic?: string;
    data?: Record<string, string>;
  };
  metadata?: Record<string, any>;
  type?: string; 
}

export type ChannelResult = {
  success: boolean;
  error?: string;
  message?: string;
};

export interface NotificationChannel {
  send(payload: NotificationPayload): Promise<ChannelResult>;
}
