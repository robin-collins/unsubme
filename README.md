# unsubme

An app built using Node.js, Express, and MongoDB that allows users to manage their email subscriptions. The app features a login system, IMAP mailbox integration, and email storage in MongoDB.

## Overview

The application is built using the following technologies:

- **Backend:** Node.js with Express framework
- **Database:** MongoDB with Mongoose ORM
- **Email Fetching:** IMAP client library
- **Frontend:** EJS view engine, Bootstrap for styling, Vanilla JavaScript for client-side interactions

### Project Structure

- **/server.js:** Main server file
- **/.env:** Environment configuration file
- **/package.json:** Project dependencies and scripts
- **/models:** Mongoose schemas for User, Email, and ImapAccount
- **/routes:** Express routes for authentication and IMAP operations
- **/services:** Service for handling IMAP functionality
- **/views:** EJS templates for rendering views
- **/public:** Static files (CSS, JS)

## Features

1. **User Authentication:**
   - Registration and login system with session management.
2. **IMAP Mailbox Integration:**
   - Users can add their IMAP mailbox details.
   - The app connects to the IMAP server and fetches all emails from the inbox.
3. **Email Storage:**
   - Fetched emails are stored in MongoDB.
   - Email information includes sender, recipient, subject, date, body, and attachments.

## Getting started

### Requirements

- Node.js
- MongoDB

### Quickstart

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd unsubme
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up the `.env` file:
   ```
   cp .env.example .env
   # Edit the .env file with your configuration
   ```
5. Start the application:
   ```bash
   npm start
   ```
6. Open your browser and navigate to `http://localhost:3000`

### Development

5. Start the application:
    ```bash
    npm run dev
    ```

## License

Copyright (c) 2024.