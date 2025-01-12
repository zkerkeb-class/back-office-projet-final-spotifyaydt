const NTFY_URL = 'https://ntfy.sh/your-topic';

export const sendNotification = async (title, message, priority = 3) => {
  try {
    await fetch(NTFY_URL, {
      method: 'POST',
      body: message,
      headers: {
        'Title': title,
        'Priority': priority.toString(),
        'Tags': 'warning'
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
  }
}; 