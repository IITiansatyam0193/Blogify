import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PostDetail from './pages/PostDetail';
import CategoriesTags from './pages/CategoriesTags';
import UserProfile from './pages/UserProfile';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

const AppContent: React.FC = () => {
  const { activeTheme } = useAuth();

  const muiTheme = useMemo(() => {
    if (!activeTheme) {
      return createTheme({
        palette: {
          primary: { main: '#1976d2' },
          secondary: { main: '#dc004e' },
        },
      });
    }

    return createTheme({
      palette: {
        primary: { main: activeTheme.colors.primary },
        secondary: { main: activeTheme.colors.secondary },
        background: {
          default: activeTheme.colors.background,
          paper: activeTheme.colors.surface,
        },
      },
      typography: {
        fontFamily: activeTheme.fonts.body,
        h1: { fontFamily: activeTheme.fonts.heading },
        h2: { fontFamily: activeTheme.fonts.heading },
        h3: { fontFamily: activeTheme.fonts.heading },
        h4: { fontFamily: activeTheme.fonts.heading },
        h5: { fontFamily: activeTheme.fonts.heading },
        h6: { fontFamily: activeTheme.fonts.heading },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: `
            body {
              background-color: ${activeTheme.colors.background};
              transition: background-color 0.3s ease;
            }
          `,
        },
      },
    });
  }, [activeTheme]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Router>
        <div className="App" style={{ minHeight: '100vh' }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/categories-tags" element={<CategoriesTags />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
