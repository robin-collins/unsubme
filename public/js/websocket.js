// public/js/websocket.js
document.addEventListener('DOMContentLoaded', function() {
  const userId = window.userId;
  console.log('Using userId for WebSocket communication:', userId);
  
  const socket = io();

  socket.on('connect', function() {
    console.log('Connected to WebSocket');
  });

  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
  });

  socket.on('fetch-progress', function(data) {
    console.log('fetch-progress event received', data); // Debug log for received progress event
    const progressContainer = document.getElementById('progressContainer');
    // log to console if the progressContainer is found or not
    console.log(progressContainer ? 'progressContainer found' : 'progressContainer not found');
    const progressText = document.getElementById('progressText');
    // log to console if the progressText is found or not
    console.log(progressText ? 'progressText found' : 'progressText not found');
    const progressBar = document.getElementById('progressBar');
    // log to console if the progressBar is found or not
    console.log(progressBar ? 'progressBar found' : 'progressBar not found');

    // log to the console if the progressContainer, progressText, and progressBar are found or not
    console.log(progressContainer && progressText && progressBar ? 'All elements found' : 'Not all elements found');
    if (progressContainer && progressText && progressBar) {
      progressContainer.style.display = 'block';
      progressText.innerText = `Fetching email ${data.current} of ${data.total}`;
      progressBar.style.width = `${data.progress}%`;
      progressBar.innerText = `${data.progress}%`;

      if (data.progress === 100) {
        setTimeout(() => {
          progressContainer.style.display = 'none';
        }, 2000); // Wait 2 seconds before hiding
      }
    }
  });

  document.getElementById('fetchEmailsLink')?.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default link behavior
    console.log('Fetch Emails link clicked');
    if (socket.connected) { // Check if socket is connected before emitting the event
      console.log('socket is connected, emitting start-fetch-emails event')
      socket.emit('start-fetch-emails'); // Emit the event to start fetching emails
    }
  });
});
