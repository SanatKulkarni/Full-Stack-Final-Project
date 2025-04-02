const express = require('express');
const router = express.Router();
const { scrapeYouTubePlaylist, Video } = require('../controllers/ytscraper');
const auth = require('../middleware/auth');

// Get all videos
router.get('/videos', auth, async (req, res) => {
    try {
        console.log('Fetching videos for user:', req.user._id);
        const videos = await Video.find({ userId: req.user._id });
        console.log('Found videos:', videos.length);
        res.json(videos);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add new playlist
router.post('/scrape-playlist', auth, async (req, res) => {
    try {
        const videos = await scrapeYouTubePlaylist(req.body.playlistUrl, req.user);
        res.json(videos);
    } catch (error) {
        console.error('Error scraping playlist:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;