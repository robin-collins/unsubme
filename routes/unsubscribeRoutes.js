const express = require('express');
const { isAuthenticated } = require('./middleware/authMiddleware');
const UnsubscribeLink = require('../models/UnsubscribeLink');
const { actionUnsubscribeLinks } = require('../services/playwrightService');
const router = express.Router();

router.get('/manage', isAuthenticated, async (req, res) => {
  try {
    const links = await UnsubscribeLink.find({}).populate('emailID');
    res.render('manage-unsubscribe', { links });
  } catch (error) {
    console.error('Error fetching unsubscribe links:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/action', isAuthenticated, async (req, res) => {
  try {
    let { links } = req.body;

    if (!links) {
      throw new Error('No links selected');
    }

    // If links is not an array, convert it to an array
    if (!Array.isArray(links)) {
      links = [links];
    }

    await actionUnsubscribeLinks(links);
    res.send('Unsubscribe actions initiated.');
  } catch (error) {
    console.error('Error actioning unsubscribe links:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
