import { LogMessage } from './logger';
import fetch from 'node-fetch';

export const webhookNotification = async (logMessage: LogMessage, webhookUrl: string) => {
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      body: JSON.stringify(logMessage),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending webhook notification:', error);
  }
};
