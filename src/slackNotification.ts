import { LogMessage } from './logger';
import fetch from 'node-fetch';

export const slackNotification = async (logMessage: LogMessage) => {
  const webhookUrl = 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK';

  const payload = {
    text: `Log Level: ${logMessage.level}\nMessage: ${logMessage.message}\nContext: ${JSON.stringify(logMessage.context)}`
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Error sending Slack notification:', err);
  }
};
