# Enhanced UnsubMe Application Specification

## Purpose

The enhanced UnsubMe application aims to help users manage their email subscriptions by identifying and processing unsubscribe links within their emails. The application will fetch emails from users' IMAP accounts, extract unsubscribe links, store them in a database, and allow users to select which links to action. The application will then use a headless, stealthed Playwright instance to visit and activate these unsubscribe links, effectively unsubscribing the user from marketing emails.

## Technologies Used

- **Backend:** Node.js with Express framework
- **Database:** MongoDB with Mongoose ORM
- **Email Fetching:** IMAP client library
- **Frontend:** EJS view engine, Bootstrap for styling, Vanilla JavaScript for client-side interactions
- **Authentication:** Bcrypt for password hashing, Express-session for session management, and Connect-mongo for session storage
- **Automation:** Playwright for headless browser automation
- **Containerization:** Docker and Docker Compose for running Playwright browser

## Features

### User Authentication

- **Registration:** Users can create an account by providing a username, email, and password.
- **Login:** Users can log in using their username and password.
- **Logout:** Users can log out, ending their session.
- **Session Management:** Sessions are stored in MongoDB to maintain user authentication state across server restarts.

### IMAP Mailbox Integration

- **Add IMAP Account:** Authenticated users can add their IMAP account details, including email address, IMAP server, port, and password.
- **Fetch Emails:** The application connects to the IMAP server using the provided credentials, fetches all emails from the inbox, and stores them in the MongoDB database.
- **Unsubscribe Link Extraction:** Scan email content for unsubscribe links and store them with a reference to the email they came from.

### Unsubscribe Link Management

- **List Unsubscribe Links:** Display a list of extracted unsubscribe links to the user.
- **Select Unsubscribe Links:** Allow users to select which unsubscribe links they want to action.
- **Automate Unsubscribe:** Use a headless, stealthed Playwright browser instance to visit and activate selected unsubscribe links.

### Email Storage

- **Email Details:** Fetched emails are stored with details such as sender, recipient, subject, date, body, and unsubscribe links.
- **Email Deduplication:** The application checks if an email already exists in the database before storing it to prevent duplicates.

## Project Structure

### Root Directory

- **server.js:** Main server file that initializes the application, sets up middleware, connects to the database, and starts the server.

### Models

- **User.js:** Defines the schema and model for user data, including username, password, and email. Passwords are hashed before saving to the database.
- **ImapAccount.js:** Defines the schema and model for storing IMAP account details linked to a user.
- **Email.js:** Defines the schema and model for storing email data fetched from the IMAP server.
- **UnsubscribeLink.js:** Defines the schema and model for storing unsubscribe links extracted from emails.

### Routes

- **authRoutes.js:** Handles user registration, login, and logout.
- **imapRoutes.js:** Handles adding IMAP account details, fetching emails from the IMAP server, and extracting unsubscribe links.
- **unsubscribeRoutes.js:** Handles displaying unsubscribe links, selecting links to action, and initiating the Playwright automation.

### Services

- **imapService.js:** Contains the logic to connect to the IMAP server, fetch emails, parse email content, extract unsubscribe links, and store emails and links in the MongoDB database.
- **playwrightService.js:** Contains the logic to use Playwright for headless browser automation to visit and activate unsubscribe links.

### Views

- **EJS Templates:** Used for rendering the frontend pages such as registration, login, adding IMAP account details, listing unsubscribe links, and the homepage.

### Public Directory

- **CSS:** Custom styles and Tailwind CSS integration.
- **JavaScript:** Placeholder for future client-side scripts.

### Environment Configuration

- **.env:** Contains environment variables for database URL, session secret, and Playwright configuration.

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

### Unsubscribe Link Management Page

**URL:** `/unsubscribe/manage`

**Elements:**

- **List of Links:** Display unsubscribe links with details about the email they came from.
- **Checkboxes:** Allow users to select which links to action.
- **Submit Button:** Trigger the Playwright automation to visit and activate selected unsubscribe links.

**Example:**

- A user selects the unsubscribe links they want to action and clicks the "Submit" button to initiate the automated unsubscription process.

## Error Handling and Logging

- **Error Pages:** Custom error messages are displayed for common errors such as registration issues, login failures, and IMAP connection problems.
- **Logging:** Errors and session activities are logged to the console for debugging and monitoring purposes.

## Security Considerations

- **Password Hashing:** User passwords are hashed using bcrypt before storing them in the database.
- **Session Security:** Sessions are stored securely in MongoDB with a secret key, preventing unauthorized access.
- **Input Validation:** User input is validated on the server side to prevent SQL injection and other common security vulnerabilities.
- **Sensitive Data Handling:** Ensure that sensitive data like email account passwords are handled securely and never logged or exposed.

## Automation with Playwright

- **Playwright Configuration:** Configure Playwright to run in headless mode with stealth options to avoid detection.
- **Containerization:** Use Docker and Docker Compose to run Playwright as part of the application stack, ensuring consistent environments and easier deployment.

This enhanced specification provides a comprehensive overview of the UnsubMe application, including its purpose, technology stack, key features, project structure, and simplified examples of UI elements. The new functionality focuses on extracting and processing unsubscribe links from emails and using automation to manage email subscriptions effectively.
