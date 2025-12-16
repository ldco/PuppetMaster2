/**
 * Telegram Bot Service
 *
 * Sends notifications to a Telegram chat/group.
 * Configure via environment variables:
 * - TELEGRAM_BOT_TOKEN: Bot token from @BotFather
 * - TELEGRAM_CHAT_ID: Chat/group ID to send messages to
 */

interface TelegramConfig {
  botToken: string
  chatId: string
}

function getConfig(): TelegramConfig | null {
  const config = useRuntimeConfig()
  const { telegramBotToken, telegramChatId } = config

  if (!telegramBotToken || !telegramChatId) {
    console.warn('[Telegram] Bot not configured - notifications will be skipped')
    return null
  }

  return {
    botToken: telegramBotToken,
    chatId: telegramChatId
  }
}

/**
 * Send a message to the configured Telegram chat
 * Supports HTML formatting
 */
export async function sendTelegramMessage(
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<boolean> {
  const config = getConfig()
  if (!config) return false

  const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        text,
        parse_mode: parseMode
      })
    })

    const result = await response.json()

    if (!result.ok) {
      console.error('[Telegram] API error:', result.description)
      return false
    }

    console.log('[Telegram] Message sent successfully')
    return true
  } catch (error) {
    console.error('[Telegram] Failed to send:', error)
    return false
  }
}

/**
 * Send contact form notification to admin
 */
export async function notifyNewContact(data: {
  name: string
  email: string
  phone?: string | null
  message: string
}): Promise<boolean> {
  const text = `
📩 <b>New Contact Form Submission</b>

<b>Name:</b> ${escapeHtml(data.name)}
<b>Email:</b> ${escapeHtml(data.email)}${data.phone ? `\n<b>Phone:</b> ${escapeHtml(data.phone)}` : ''}

<b>Message:</b>
${escapeHtml(data.message)}
`.trim()

  return sendTelegramMessage(text)
}

/**
 * Escape HTML special characters for Telegram
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

