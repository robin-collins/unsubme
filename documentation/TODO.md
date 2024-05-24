# Unsubme Application - Checklist of Items to be Resolved

## Omissions

- [ ] Add error handling for failed database operations in the route handlers with try-catch blocks.

## Recommended Improvements

**Code Organization:**

- [ ] Break down complex functions like `fetchEmails` in `imapService.js` into smaller, more focused functions.

**Error Handling:**

- [ ] Add error handling around critical operations, such as IMAP fetching and database updates.

**Database Operations:**

- [ ] Use a batch insert operation (`insertMany`) in `fetchEmails` instead of saving each email individually.

**Frontend Improvements:**

- [ ] Provide clear feedback to users during email fetching, unsubscribe actions, and other operations with progress indicators and status messages.

**Validation and Error Messages:**

- [ ] Implement thorough validation for all user inputs, including email addresses, passwords, IMAP credentials, and schedules.
- [ ] Add specific error messages for common errors like validation failures or connection issues in the controllers.

**Logging:**

- [ ] Improve logging throughout the codebase to aid in debugging and monitoring using a logging library like `bunyan`.

**CSRF Protection:**

- [ ] Implement CSRF protection to prevent cross-site request forgery attacks.

**Documentation:**

- [ ] Add inline comments and function descriptions to improve code readability.
- [ ] Provide clear setup instructions and usage documentation in the `README.md`.

#### Specific Code Snippets to Address

**Password Hashing in `User.js`:**

- [ ] Update the `User.js` file to ensure password hashing logic correctly handles password updates.

  ```javascript
  userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
      } catch (err) {
        next(err);
      }
    } else {
      next();
    }
  });
  ```

**Authentication Middleware:**

- [ ] Refactor the `isAuthenticated` middleware to improve clarity and efficiency.

  ```javascript
  const isAuthenticated = async (req, res, next) => {
    try {
      if (req.session && req.session.userId) {
        const user = await User.findById(req.session.userId);
        if (user) {
          req.user = user;
          const imapAccount = await ImapAccount.findOne({ userID: req.session.userId });
          res.locals.hasImapAccount = !!imapAccount;
          return next();
        }
      }
      res.status(401).send('You are not authenticated');
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  ```

**Error Handling in `emailSettingsService.js`:**

- [ ] Improve error handling in `emailSettingsService.js`.

  ```javascript
  const getEmailSettings = async (email) => {
    try {
      const response = await axios.get(`https://emailsettings.firetrust.com/settings?q=${email}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching email settings:', error);
      throw new Error(error.response ? error.response.data : 'Unable to fetch email settings');
    }
  };
  ```
