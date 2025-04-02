import { useState } from 'react';
import { 
  Container, 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button,
  Tabs,
  Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TodoList from './TodoList';
import YouTubeViewer from './YouTubeViewer';

const Dashboard = () => {
  const [tab, setTab] = useState(0);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
        <Tabs 
          value={tab} 
          onChange={handleTabChange}
          centered
          sx={{ bgcolor: 'primary.dark' }}
        >
          <Tab label="Todo List" />
          <Tab label="YouTube Videos" />
        </Tabs>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {tab === 0 ? <TodoList /> : <YouTubeViewer />}
      </Container>
    </Box>
  );
};

export default Dashboard;