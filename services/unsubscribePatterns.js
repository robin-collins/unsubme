const unsubscribePatterns = [
  /(?:manage\s+preferences|update\s+your\s+profile)\s*<(https?:\/\/[^>]+)>/gi,
  /(?:unsubscribe|opt[ -]out|remove)\s*here[^<]*<(https?:\/\/[^>]+)>/gi,
  /(?:unsubscribe|subscription\s*preferences)\s*:\s*(https?:\/\/[^<\s]+)/gi,
  /<a href="(https?:\/\/[^"]+)"[^>]*>Unsubscribe<\/a>/gi,
  /<a[^>]*href="(https?:\/\/[^"]*unsub[^"]*)"[^>]*>/gi,
  /<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>\s*(?:unsubscribe|opt[ -]out|remove)\s*<\/a>/gi,
  /Unsubscribe<(https?:\/\/[^>]+)>/gi,
  /\((https?:\/\/.*?(?:unsubscribe|opt-out).*?)\)/gi,
  /click\s+below\s+to\s+unsubscribe[^<]*<(https?:\/\/[^>]+)>/gi,
  /click\s+here\s*<(https?:\/\/[^>]+)>/gi,
  /click\s+here\s+to\s+change\s+your\s+email\s+preferences[^<]*<(https?:\/\/[^>]+)>/gi,
  /email\s+preferences[^<]*<(https?:\/\/[^>]+)>/gi,
  /href="(https?:\/\/[^"]*(?:unsubscribe|opt[ -]out|remove)[^"]*)"[^>]*>(?:unsubscribe|opt[ -]out|remove)\s*here<\/a>/gi,
  /href="(https?:\/\/[^"]+unsub[^"]+)"/gi,
  /https?:\/\/\S+unsub\S+/gi,
  /https?:\/\/\S+unsubscribe\S+/gi,
  /manage\s+your\s+email\s+preferences[^<]*<(https?:\/\/[^>]+)>/gi,
  /preferences\s*center[^<]*<(https?:\/\/[^>]+)>/gi,
  /to\s+unsubscribe[^<]+<(https?:\/\/[^>]+)>/gi,
  /unsub.+?href="(https?:\/\/[^"]+)"/gi,
  /unsub[^<]+<(https?:\/\/[^>]+)>/gi,
  /unsubscribe\s+from\s+this\s+list[^<]*<(https?:\/\/[^>]+)>/gi,
  /update\s+your\s+preferences[^<]*<(https?:\/\/[^>]+)>/gi,
  /https?:\/\/\S+preferences-center\S+/gi,
  /https?:\/\/\S+proc\.php\S+act=unsub/gi,
  /https?:\/\/\S+ls\/click\S+upn=\S+/gi,
  /https?:\/\/\S+link\/c\/\S+/gi,
  /https?:\/\/\S+link-tracker\S+/gi,
  /https?:\/\/\S+email_preferences\S+/gi,
  /https?:\/\/\S+subscription_center\S+/gi,
  /https?:\/\/\S+manage_subscriptions\S+/gi,
  /https?:\/\/\S+email_settings\S+/gi,
  /https?:\/\/\S+communication_preferences\S+/gi,
  /https?:\/\/\S+email_options\S+/gi,
  /https?:\/\/\S+unsubscribe_center\S+/gi,
  /https?:\/\/\S+manage_email_preferences\S+/gi,
  /https?:\/\/\S+subscription_management\S+/gi,
  /https?:\/\/\S+email_preference_center\S+/gi,
];

module.exports = unsubscribePatterns;