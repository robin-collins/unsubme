// services/playwrightService.js
const Redis = require('ioredis');
const mongoose = require('mongoose');
const UnsubscribeLink = require('../models/UnsubscribeLink');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

const actionUnsubscribeLinks = async (links) => {
  for (const linkID of links) {
    let linkDoc;
    try {
      const objectId = new mongoose.Types.ObjectId(linkID);
      linkDoc = await UnsubscribeLink.findById(objectId).populate('emailID');
    } catch (error) {
      console.error(`Invalid ObjectId: ${linkID}`, error);
      continue;
    }

    if (linkDoc && linkDoc.link) {
      try {
        await redis.lpush('unsubscribe_links', JSON.stringify({ link: linkDoc.link, linkID }));
        console.log(`Queued unsubscribe link: ${linkDoc.link}`);
      } catch (error) {
        console.error(`Error queuing link: ${linkDoc.link}`, error);
      }
    }
  }
};

module.exports = {
  actionUnsubscribeLinks,
};
