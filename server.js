// server.js
const http = require('http');
const { Server } = require("socket.io");
const app = require('./app'); // Import the Express app
const ImapAccount = require("./models/ImapAccount");
const { fetchEmails } = require("./services/imapService");

const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('start-fetch-emails', async () => {
    const userId = socket.id; // Use the socket ID to identify the user
    // Fetch emails for the user
    const imapAccounts = await ImapAccount.find({ userID: userId });
    for (const imapAccount of imapAccounts) {
      const imapInfo = {
        email: imapAccount.email,
        server: imapAccount.server,
        port: imapAccount.port,
        password: imapAccount.password
      };
      await fetchEmails(imapInfo, imapAccount._id, userId);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = { io }; // Export the io instance for use in other modules
