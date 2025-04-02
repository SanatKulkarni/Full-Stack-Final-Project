const puppeteer = require('puppeteer');
const Video = require('../models/Video');

async function scrapeYouTubePlaylist(playlistUrl, user) {
    const browser = await puppeteer.launch({ headless: "new" });
    try {
        const page = await browser.newPage();
        
        // Navigate to the playlist
        await page.goto(playlistUrl, { waitUntil: 'networkidle2' });
        
        // Wait for the playlist items to load
        await page.waitForSelector('ytd-playlist-panel-video-renderer', { timeout: 60000 });
        
        // Scroll to load more videos
        await autoScroll(page);
        
        // Extract video data
        const videos = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('ytd-playlist-panel-video-renderer'));
            return items.map(item => {
                const titleElement = item.querySelector('#video-title');
                const title = titleElement ? titleElement.textContent.trim() : 'No title';
                const linkElement = item.querySelector('a.yt-simple-endpoint');
                const link = linkElement ? linkElement.href : '';
                return { title, link };
            });
        });
        
        // Save to MongoDB with user information
        await Video.deleteMany({ playlistUrl, userId: user._id }); // Clear old entries
        const videoDocs = videos.map(video => ({
            ...video,
            playlistUrl,
            userId: user._id,
            username: user.username
        }));
        await Video.insertMany(videoDocs);
        
        console.log(`Scraped and saved ${videos.length} videos to MongoDB`);
        return videos;
    } catch (error) {
        console.error('Error scraping YouTube playlist:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

// Helper function to scroll to the bottom of the page
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.documentElement.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                
                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

module.exports = { scrapeYouTubePlaylist, Video };