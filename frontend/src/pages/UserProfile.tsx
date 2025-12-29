import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Alert, Spinner, Badge, Tab, Tabs } from 'react-bootstrap';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { useAuth } from '../hooks/useAuth';
import { Post, Profile } from '../types';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    }
  }, [userId]);

  const fetchProfile = async (id: string) => {
    try {
      setLoading(true);
      setError('');
      
      const [profileRes, postsRes] = await Promise.all([
        axios.get(`/api/friends/user/${id}/profile`),
        axios.get(`/api/friends/user/${id}/blogs`)
      ]);
      
      setProfile(profileRes.data.data.profile);
      setPosts(profileRes.data.data.publicPosts || postsRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFriendRequest = async () => {
    if (!currentUser?._id || !userId || currentUser._id === userId) return;

    try {
      setSendingRequest(true);
      console.log('Sending friend request to:', userId); // DEBUG
      
      await axios.post('/api/friends/request', {
        toUserId: userId
      });
      
      console.log('Friend request sent! Refreshing profile...'); // DEBUG
      
      // ✅ CRITICAL: REFRESH PROFILE DATA
      await fetchProfile(userId!);
      
      console.log('Profile refreshed:', profile); // DEBUG
    } catch (err: any) {
      console.error('Friend request failed:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSendingRequest(false);
    }
  };


  const isFriend = profile && currentUser?._id 
    ? profile.friends?.some(f => f === currentUser._id)
    : false;

  const hasPendingRequest = profile && currentUser?._id
    ? profile.incomingRequests?.some(r => r.from === currentUser._id && r.status === 'pending')
    : false;

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Container>
          <Row className="justify-content-center">
            <Col md={6}>
              <Alert variant="warning">
                <Alert.Heading>Profile not found</Alert.Heading>
                <Link className="btn btn-primary" to="/" style={{ textDecoration: 'none' }}>
                  Go to Home
                </Link>
              </Alert>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-5 bg-light">
      <Container>
        {/* Profile Header */}
        <Row className="mb-5">
          <Col md={3} className="text-center mb-4">
            <div className="avatar-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3">
              <h2>{profile?.name.charAt(0).toUpperCase()}</h2>
            </div>
          </Col>
          <Col md={9}>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h1 className="display-5 fw-bold mb-1">{profile?.name}</h1>
                <p className="text-muted mb-2">{profile?.email || 'no-email@blogify.com'}</p>
                <div>
                  <Badge bg="success">{profile?.friends?.length ?? 0} Friends</Badge>{' '}
                  <Badge bg="info">{posts?.length ?? 0} Posts</Badge>
                </div>
              </div>
              
              {isAuthenticated && currentUser?._id !== userId && (
                <div className="d-flex gap-2">
                  {isFriend ? (
                    <Button variant="success" size="sm">
                      Friends ✓
                    </Button>
                  ) : hasPendingRequest ? (
                    <Button variant="warning" size="sm" disabled>
                      Request Sent
                    </Button>
                  ) : (
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={handleFriendRequest}
                      disabled={sendingRequest}
                    >
                      {sendingRequest ? 'Sending...' : 'Add Friend'}
                    </Button>
                  )}
                  <Button variant="outline-secondary" size="sm">
                    Message
                  </Button>
                </div>
              )}
            </div>
          </Col>
        </Row>

        {/* Content Tabs */}
        <Row>
          <Col md={12}>
            <Tabs defaultActiveKey="posts" id="profile-tabs" className="mb-4">
              <Tab eventKey="posts" title={`Posts (${posts.length})`}>
                <Row className="g-4">
                  {posts.length === 0 ? (
                    <Col md={12}>
                      <div className="text-center py-5">
                        <h5>No posts yet</h5>
                        <p className="text-muted">
                          {currentUser?._id === userId 
                            ? 'Create your first post from dashboard!' 
                            : 'No public posts available'
                          }
                        </p>
                        {currentUser?._id === userId && (
                          <Link to="/dashboard" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                            Create Post
                          </Link>
                        )}
                      </div>
                    </Col>
                  ) : (
                    posts.map((post) => (
                      <Col md={6} lg={4} key={post._id}>
                        <PostCard post={post} />
                      </Col>
                    ))
                  )}
                </Row>
              </Tab>
              
              <Tab eventKey="friends" title={`Friends (${profile?.friends?.length})`}>
                <div className="text-center py-5">
                  <h5>Friends List (Coming Soon)</h5>
                  <p className="text-muted">
                    View your friends and their recent activity.
                  </p>
                </div>
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UserProfile;
