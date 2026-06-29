/**
 * Zero-dependency Telegram Storage Provider utilizing native Node.js fetch
 */
const uploadToTelegram = async (fileBuffer, fileName, mimeType) => {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8973841556:AAFgx0uuRvDnp13-NZ29XNwqMKrFQfNQI2A';
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1003680485341';

  try {
    const isVideo = mimeType.startsWith('video');
    const endpoint = isVideo ? 'sendVideo' : 'sendPhoto';
    const fieldName = isVideo ? 'video' : 'photo';

    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    
    // Create a Blob from buffer for FormData
    const fileBlob = new Blob([fileBuffer], { type: mimeType });
    formData.append(fieldName, fileBlob, fileName);

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${endpoint}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Telegram API response error: ${errText}`);
    }

    const data = await response.json();
    const message = data.result;
    let fileId = '';

    if (isVideo) {
      fileId = message.video.file_id;
    } else {
      fileId = message.photo[message.photo.length - 1].file_id;
    }

    // Get file path
    const fileInfoRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`);
    if (!fileInfoRes.ok) {
      throw new Error(`Telegram getFile API error`);
    }
    const fileInfoData = await fileInfoRes.json();
    const filePath = fileInfoData.result.file_path;

    const directUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;

    return {
      url: directUrl,
      publicId: fileId,
    };
  } catch (err) {
    console.error('Telegram upload error:', err.message);
    throw err;
  }
};

module.exports = { uploadToTelegram };
