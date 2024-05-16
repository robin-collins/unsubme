# Application Specification for UnsubMe

## Purpose

UnsubMe is an application designed to help users manage their email subscriptions by integrating with their IMAP email accounts. The application allows users to register and log in, add their IMAP account details, fetch emails from their inbox, and store these emails in a MongoDB database. This functionality provides users with a centralized platform to view and manage their email subscriptions efficiently.

## Technologies Used

- **Backend:** Node.js with Express framework
- **Database:** MongoDB with Mongoose ORM
- **Email Fetching:** IMAP client library
- **Frontend:** EJS view engine, Bootstrap for styling, Vanilla JavaScript for client-side interactions
- **Authentication:** Bcrypt for password hashing, Express-session for session management, and Connect-mongo for session storage

## Features

### User Authentication

- **Registration:** Users can create an account by providing a username, email, and password.
- **Login:** Users can log in using their username and password.
- **Logout:** Users can log out, ending their session.
- **Session Management:** Sessions are stored in MongoDB to maintain user authentication state across server restarts.

### IMAP Mailbox Integration

- **Add IMAP Account:** Authenticated users can add their IMAP account details, including email address, IMAP server, port, and password.
- **Fetch Emails:** The application connects to the IMAP server using the provided credentials, fetches all emails from the inbox, and stores them in the MongoDB database.

### Email Storage

- **Email Details:** Fetched emails are stored with details such as sender, recipient, subject, date, and body.
- **Email Deduplication:** The application checks if an email already exists in the database before storing it to prevent duplicates.

## Project Structure

### Root Directory

- **server.js:** Main server file that initializes the application, sets up middleware, connects to the database, and starts the server.

### Models

- **User.js:** Defines the schema and model for user data, including username, password, and email. Passwords are hashed before saving to the database.
- **ImapAccount.js:** Defines the schema and model for storing IMAP account details linked to a user.
- **Email.js:** Defines the schema and model for storing email data fetched from the IMAP server.

### Routes

- **authRoutes.js:** Handles user registration, login, and logout.
- **imapRoutes.js:** Handles adding IMAP account details and fetching emails from the IMAP server.
- **middleware/authMiddleware.js:** Middleware to check if a user is authenticated before allowing access to certain routes.

### Services

- **imapService.js:** Contains the logic to connect to the IMAP server, fetch emails, parse email content, and store emails in the MongoDB database.

### Views

- **EJS Templates:** Used for rendering the frontend pages such as registration, login, adding IMAP account details, and the homepage.

### Public Directory

- **CSS:** Custom styles and Tailwind CSS integration.
- **JavaScript:** Placeholder for future client-side scripts.

### Environment Configuration

- **.env:** Contains environment variables for database URL and session secret.

## Simplified Examples of UI Elements

### Registration Page

**URL:** `/auth/register`

**Elements:**

- **Form Fields:** Username, Email Address, Password
- **Submit Button:** Register

**Example:**

- A user fills out the registration form and clicks the "Register" button to create a new account.

### Login Page

**URL:** `/auth/login`

**Elements:**

- **Form Fields:** Username, Password
- **Submit Button:** Login
- **Link:** Redirect to registration page if the user does not have an account.

**Example:**

- A user enters their username and password, then clicks the "Login" button to authenticate.

### IMAP Account Addition Page

**URL:** `/imap/add-imap-account`

**Elements:**

- **Form Fields:** Email Address, IMAP Server, Port, Password
- **Submit Button:** Submit

**Example:**

- An authenticated user provides their IMAP account details and clicks the "Submit" button to save the information.

### Home Page

**URL:** `/`

**Elements:**

- **Header:** Navigation links to home, add IMAP account, login/logout.
- **Main Content:** Application title and description.

**Example:**

- The homepage displays the application name "unsubme" and a brief description of its purpose.

### Fetch Emails

**URL:** `/imap/fetch-emails`

**Elements:**

- **Trigger:** A button or link that initiates the email fetching process.

**Example:**

- An authenticated user clicks a button to fetch emails from their linked IMAP accounts.

## Error Handling and Logging

- **Error Pages:** Custom error messages are displayed for common errors such as registration issues, login failures, and IMAP connection problems.
- **Logging:** Errors and session activities are logged to the console for debugging and monitoring purposes.

## Security Considerations

- **Password Hashing:** User passwords are hashed using bcrypt before storing them in the database.
- **Session Security:** Sessions are stored securely in MongoDB with a secret key, preventing unauthorized access.
- **Input Validation:** User input is validated on the server side to prevent SQL injection and other common security vulnerabilities.

This specification provides an overview of the UnsubMe application, highlighting its purpose, technology stack, key features, project structure, and simplified examples of UI elements.
