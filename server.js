const http = require('http');
const app = require('./app'); // Import the Express app
const ImapAccount = require("./models/ImapAccount");
const { fetchEmails } = require("./services/imap");
const { initSocket, getIo } = require('./services/socket');
const sharedSession = require('express-socket.io-session');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const port = process.env.PORT || 3000;
const server = http.createServer(app);

// Session setup
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL })
});

app.use(sessionMiddleware);

// Initialize socket.io and pass the server
initSocket(server);

const io = getIo();

// Attach session middleware to socket.io
io.use(sharedSession(sessionMiddleware, {
  autoSave: true
}));

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('start-fetch-emails', async () => {
    console.log('start-fetch-emails event received');
    if (socket.handshake.session && socket.handshake.session.userId) {
      const userId = socket.handshake.session.userId; // Use the session user ID to identify the user
      console.log('User ID:', userId);
      const imapAccounts = await ImapAccount.find({ userID: userId });
      console.log('IMAP Accounts found:', imapAccounts.length);

      for (const imapAccount of imapAccounts) {
        const imapInfo = {
          email: imapAccount.email,
          server: imapAccount.server,
          port: imapAccount.port,
          password: imapAccount.password
        };
        console.log('Fetching emails for account:', imapAccount.email);
        await fetchEmails(imapInfo, imapAccount._id, userId);
      }
    } else {
      console.error('No user ID found in session');
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.get('/fetch-emails', (req, res) => {
  console.log('/fetch-emails route accessed');
  if (req.session && req.session.userId) {
    const io = getIo();
    io.to(req.session.userId).emit('start-fetch-emails');
    console.log('start-fetch-emails event emitted to user:', req.session.userId);
    res.redirect('/');
  } else {
    res.redirect('/auth/login?message=Please log in to fetch emails.');
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
