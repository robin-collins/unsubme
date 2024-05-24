// worker.js
const Redis = require('ioredis');
const playwright = require('playwright');
const mongoose = require('mongoose');
const UnsubscribeLink = require('./models/UnsubscribeLink');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

const processQueue = async () => {
  const browser = await playwright.chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();

  while (true) {
    const linkData = await redis.brpop('unsubscribe_links', 0); // Block until a link is available
    const { link, linkID } = JSON.parse(linkData[1]);

    const page = await context.newPage();
    try {
      await page.goto(link);
      console.log(`Visited unsubscribe link: ${link}`);
      
      // Update the status in the database
      const objectId = new mongoose.Types.ObjectId(linkID);
      const linkDoc = await UnsubscribeLink.findById(objectId);
      linkDoc.status = 'completed';
      await linkDoc.save();
    } catch (error) {
      console.error(`Error visiting link: ${link}`, error);
    } finally {
      await page.close();
    }
  }

  await browser.close();
};

processQueue().catch(error => {
  console.error('Error processing queue:', error);
});
