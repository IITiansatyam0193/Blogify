import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#1a1a1a' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: 1
            }}
          >
            Blogify
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button component={Link} to="/" color="inherit">
              Home
            </Button>
            {isAuthenticated && (
              <>
                <Button component={Link} to="/dashboard" color="inherit">
                  Dashboard
                </Button>
                <Button component={Link} to="/categories-tags" color="inherit">
                  Categories
                </Button>
                <Button component={Link} to="/analytics" color="inherit">
                  Analytics
                </Button>
              </>
            )}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
                  Hi, {user?.name}
                </Typography>
                <Button
                  component={Link}
                  to={`/profile/${user?._id}`}
                  color="inherit"
                  variant="outlined"
                  size="small"
                >
                  My Profile
                </Button>
                <Button
                  onClick={handleLogout}
                  color="error"
                  variant="contained"
                  size="small"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button component={Link} to="/login" color="inherit">
                  Login
                </Button>
                <Button component={Link} to="/register" variant="contained" color="primary">
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
