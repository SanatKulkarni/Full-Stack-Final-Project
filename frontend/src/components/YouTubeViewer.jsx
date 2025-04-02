import { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Box,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const YouTubeViewer = () => {
  const [videos, setVideos] = useState([]);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // Add this line
  const { token } = useAuth();

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    fetchAllVideos();
  }, []);

  const getVideoId = (url) => {
    try {
      if (url.includes('watch?v=')) {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('v');
      } else if (url.includes('youtu.be/')) {
        return url.split('youtu.be/')[1].split('?')[0];
      }
      return null;
    } catch {
      return null;
    }
  };

  const fetchAllVideos = async () => {
    console.log('Starting to fetch videos...');
    try {
      console.log('Making API request to fetch videos');
      // Fix the endpoint URL
      const response = await axios.get('http://localhost:5000/api/videos', { headers });
      console.log('Raw API response:', response.data);
      
      if (!response.data || response.data.length === 0) {
        console.log('No videos found in database');
        setVideos([]);
        return;
      }

      const groupedVideos = {};
      console.log('Grouping videos by playlist...');
      
      response.data.forEach(video => {
        const playlistKey = video.playlistUrl || 'default';
        console.log('Processing video:', video.title, 'from playlist:', playlistKey); // Debug each video
        if (!groupedVideos[playlistKey]) {
          console.log('Found new playlist:', playlistKey);
          groupedVideos[playlistKey] = {
            url: video.playlistUrl,
            videos: []
          };
        }
        const videoId = getVideoId(video.link);
        if (videoId) {
          console.log('Valid video ID found:', videoId);
          groupedVideos[playlistKey].videos.push(video);
        }
      });
      
      const playlists = Object.values(groupedVideos);
      console.log('Final processed playlists:', playlists);
      setVideos(playlists);
    } catch (error) {
      console.error('Error details:', error.response || error);
      setError(error.response?.data?.error || 'Failed to fetch videos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      console.log('Submitting playlist URL:', playlistUrl);
      const response = await axios.post('http://localhost:5000/api/scrape-playlist', 
        { playlistUrl },
        { headers }
      );
      console.log('Playlist scraping response:', response.data);
      setPlaylistUrl('');
      await fetchAllVideos();
    } catch (error) {
      console.error('Submission error details:', error.response || error);
      setError(error.response?.data?.error || 'Failed to add playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    console.log('Refreshing playlists...');
    setRefreshKey(prev => prev + 1);
    fetchAllVideos();
  };

  // Remove everything between here and the return statement
  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="YouTube Playlist URL"
            value={playlistUrl}
            onChange={(e) => setPlaylistUrl(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
            placeholder="https://www.youtube.com/playlist?list=..."
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Add Playlist'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleRefresh}
              disabled={loading}
            >
              Show Playlists
            </Button>
          </Box>
        </form>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      {videos.map((playlist, playlistIndex) => (
        <Box key={playlistIndex} sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, borderBottom: '2px solid #eee', pb: 1 }}>
            {playlist.url ? `Playlist ${playlistIndex + 1}` : 'Videos'}
          </Typography>
          <Grid container spacing={3}>
            {playlist.videos.map((video, videoIndex) => {
              const videoId = getVideoId(video.link);
              return (
                <Grid item xs={12} md={6} key={videoIndex}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          mb: 2,
                          minHeight: '3em',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {video.title}
                      </Typography>
                      <Box sx={{ position: 'relative', paddingTop: '56.25%', mb: 2 }}>
                        <iframe
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            borderRadius: '4px'
                          }}
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={video.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}
    </Container>
  );
};

export default YouTubeViewer;