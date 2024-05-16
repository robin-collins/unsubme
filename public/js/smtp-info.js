document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('emailAddress').addEventListener('blur', fetchSmtpSettings);

  async function fetchSmtpSettings() {
    const emailAddress = document.getElementById('emailAddress').value;
    if (!isValidEmail(emailAddress)) {
      showModal('Error', 'Invalid email address');
      return;
    }
    console.log(`Fetching settings for email: ${emailAddress}`);

    try {
      const response = await fetch('/account/fetch-smtp-settings', {
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

      document.getElementById('smtpServer').value = data.address;
      document.getElementById('port').value = data.port;
      document.getElementById('encryption').value = data.secure;
    } catch (error) {
      console.error('Error fetching email settings:', error);
      showModal('Error', 'Failed to fetch email settings');
    }
  }

  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  document.getElementById('testSmtpButton').addEventListener('click', async () => {
    const emailAddress = document.getElementById('emailAddress').value;
    const username = document.getElementById('username').value;
    const smtpServer = document.getElementById('smtpServer').value;
    const port = document.getElementById('port').value;
    const password = document.getElementById('password').value;
    const encryption = document.getElementById('encryption').value;

    const testSmtpDetails = { emailAddress, username, smtpServer, port, password, encryption };

    try {
      const response = await fetch('/account/test-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testSmtpDetails),
      });

      const result = await response.json();

      if (result.success) {
        showModal('Success', 'SMTP connection successful!');
        enableSubmitButton();
      } else {
        showModal('Error', `SMTP connection failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Error testing SMTP settings:', error);
      showModal('Error', 'Error testing SMTP settings');
    }
  });

  function enableSubmitButton() {
    const submitButton = document.getElementById('submitSmtpButton');
    submitButton.disabled = false;
    submitButton.classList.remove('bg-gray-400', 'cursor-not-allowed');
    submitButton.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
  }

  function showModal(title, message) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalMessage').innerText = message;
    const modal = document.getElementById('messageModal');
    modal.classList.remove('hidden');
  }

  document.getElementById('modalCloseButton').addEventListener('click', () => {
    const modal = document.getElementById('messageModal');
    modal.classList.add('hidden');
  });
});
