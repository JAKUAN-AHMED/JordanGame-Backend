import cron from "node-cron";
import fs from "fs";
import { Story } from "../modules/story/story.model";

// Run every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  const now = new Date();
  const expiredStories = await Story.find({ expiresAt: { $lte: now } });

  for (const story of expiredStories) {
    // Delete media files if needed
    for (const url of story.mediaUrl) {
      const filePath = url.replace(process.env.BACKEND_LIVE_URL + "/", "");
      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete file:", filePath, err);
      });
    }

    await Story.deleteOne({ _id: story._id });
    console.log(`Deleted expired story ${story._id}`);
  }
});
