require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const authRoutes = require("./routes/authRoutes");
const imapRoutes = require("./routes/imapRoutes");
const unsubscribeRoutes = require("./routes/unsubscribeRoutes");
const accountRoutes = require('./routes/accountRoutes');
const User = require("./models/User");
const ImapAccount = require("./models/ImapAccount");

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
  console.error("Error: config environment variables not set. Please create/edit .env configuration file.");
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setting the templating engine to EJS
app.set("view engine", "ejs");

// Serve static files
app.use(express.static("public"));

// Database connection
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error(`Database connection error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });

// Session configuration with connect-mongo
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
  })
);

// Middleware to check if there are any users in the database
app.use(async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    res.locals.hasImapAccount = false; // Set default value for hasImapAccount

    if (userCount === 0 && req.path !== '/auth/register' && req.path !== '/auth/login') {
      return res.redirect('/auth/register');
    }

    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (!user) {
        return res.status(401).send('User not found');
      }
      req.user = user;

      // Check if user has an IMAP account
      const imapAccount = await ImapAccount.findOne({ userID: req.session.userId });
      res.locals.hasImapAccount = !!imapAccount;
    }

    next();
  } catch (error) {
    console.error('Error checking user count:', error);
    next(error);
  }
});

// Logging session creation and destruction
app.use((req, res, next) => {
  const sess = req.session;
  // Make session available to all views
  res.locals.session = sess;
  if (!sess.views) {
    sess.views = 1;
    console.log("Session created at: ", new Date().toISOString());
  } else {
    sess.views++;
    console.log(
      `Session accessed again at: ${new Date().toISOString()}, Views: ${sess.views}, User ID: ${sess.userId || '(unauthenticated)'}`
    );
  }
  next();
});

// Authentication Routes
app.use('/auth', authRoutes);

// IMAP Routes
app.use('/imap', imapRoutes);

// Unsubscribe Routes
app.use('/unsubscribe', unsubscribeRoutes);

// Account Routes
app.use('/account', accountRoutes);

// Root path response
app.get("/", (req, res) => {
  res.render("index");
});

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
