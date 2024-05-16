// /public/js/imap-info.js

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('emailAddress').addEventListener('blur', fetchEmailSettings);

  async function fetchEmailSettings() {
    const emailAddress = document.getElementById('emailAddress').value;
    if (!isValidEmail(emailAddress)) {
      console.log('Invalid email address');
      return;
    }
    console.log(`Fetching settings for email: ${emailAddress}`);

    try {
      const response = await fetch('/imap/fetch-email-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailAddress }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch email settings: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched email settings:', data);

      document.getElementById('imapServer').value = data.address;
      document.getElementById('port').value = data.port;
    } catch (error) {
      console.error('Error fetching email settings:', error);
    }
  }

  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
});
