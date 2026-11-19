export interface TelegramButton {
  text: string;
  url: string;
}

export const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const telegramConfigured = () => Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

export async function sendTelegram(html: string, buttons: TelegramButton[] = []): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    if (!process.env.VERCEL) {
      console.info(`[uplink] telegram is not configured, message:\n${html}`);
      buttons.forEach((button) => console.info(`[uplink] ${button.text}: ${button.url}`));
      return true;
    }
    return false;
  }

  const secureButtons = buttons.filter((button) => button.url.startsWith("https://"));
  const insecure = buttons.filter((button) => !button.url.startsWith("https://"));
  const text = insecure.length
    ? `${html}\n\n${insecure.map((button) => `${escapeHtml(button.text)}: ${escapeHtml(button.url)}`).join("\n")}`
    : html;

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      ...(secureButtons.length
        ? { reply_markup: { inline_keyboard: [secureButtons.map((button) => ({ text: button.text, url: button.url }))] } }
        : {})
    }),
    signal: AbortSignal.timeout(6000)
  });
  return response.ok;
}
