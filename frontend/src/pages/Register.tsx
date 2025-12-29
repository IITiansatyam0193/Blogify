import React, { useState } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      navigate('/login?registered=true');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-5">
                  <h1 className="h3 mb-3 fw-bold text-dark">Create Account</h1>
                  <p className="text-muted">Join Blogify today</p>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="form-group mb-4">
                    <label className="form-label fw-semibold mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="form-control form-control-lg shadow-sm"
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label fw-semibold mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="form-control form-control-lg shadow-sm"
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label fw-semibold mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Create a password (6+ characters)"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      disabled={loading}
                      className="form-control form-control-lg shadow-sm"
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label fw-semibold mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="form-control form-control-lg shadow-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 btn-lg fw-semibold shadow-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          role="status"
                          className="me-2"
                        />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <p className="text-muted mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary fw-semibold">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;
