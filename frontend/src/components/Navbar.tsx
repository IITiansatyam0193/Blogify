import React from 'react';
import { Navbar as BSNavbar, Nav, Container, Button } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // Don't render until auth is ready
  }

  return (
    <BSNavbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <BSNavbar.Brand href="/">Blogify</BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            {isAuthenticated && (
              <>
              <Nav.Link href="/dashboard">Dashboard</Nav.Link>
              <Nav.Link href="/categories-tags">Categories & Tags</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <Nav.Link>Welcome, {user?.name}</Nav.Link>
                <Button variant="outline-light" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link href="/login">Login</Nav.Link>
                <Nav.Link href="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;
