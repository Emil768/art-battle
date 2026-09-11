
export async function postCollageToTelegram(imageBuffer: Buffer, caption?: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn("[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set, skipping post");
    return false;
  }

  const form = new FormData();
  form.set("chat_id", chatId);
  if (caption) form.set("caption", caption);
  form.set("photo", new Blob([new Uint8Array(imageBuffer)], { type: "image/png" }), "result.png");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Telegram sendPhoto failed: ${res.status} ${body}`);
  }

  return true;
}
