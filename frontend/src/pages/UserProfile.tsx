import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Avatar,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Stack
} from '@mui/material';
import {
  PersonAdd as AddIcon,
  Check as AcceptIcon,
  Close as RejectIcon,
  People as FriendsIcon,
  Article as PostsIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { Profile, Post } from '../types';
import PostCard from '../components/PostCard';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, isAuthenticated, token } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const [isFriend, setIsFriend] = useState(false);
  const [hasSentRequest, setHasSentRequest] = useState(false);
  const [hasReceivedRequest, setHasReceivedRequest] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    }
  }, [userId]);

  const fetchProfile = async (id: string) => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`/api/friends/user/${id}/profile`);
      const data = response.data.data;
      console.log(data)
      setProfile({...data, ...data.profile});
      setPosts(data.publicPosts || []);
      setIsFriend(data.isFriend);
      setHasSentRequest(data.hasSentRequest);
      setHasReceivedRequest(data.hasReceivedRequest);
    } catch (err: any) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    try {
      await axios.post('/api/friends/request', { toUserId: userId });
      setHasSentRequest(true);
    } catch (err) {
      alert('Failed to send friend request');
    }
  };

  const handleResponse = async (action: 'accept' | 'reject') => {
    try {
      await axios.post(`/api/friends/request/${action}`, { fromUserId: userId });
      if (action === 'accept') {
        setIsFriend(true);
        setHasReceivedRequest(false);
      } else {
        setHasReceivedRequest(false);
      }
    } catch (err) {
      alert(`Failed to ${action} request`);
    }
  };

  const handleRemoveFriend = async () => {
    if (!window.confirm('Remove friend?')) return;
    try {
      await axios.delete(`/api/friends/remove/${userId}`);
      setIsFriend(false);
    } catch (err) {
      alert('Failed to remove friend');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (error || !profile) return <Container sx={{ mt: 10 }}><Alert severity="error">{error || 'User not found'}</Alert></Container>;

  const isOwnProfile = currentUser?._id === profile._id;

  return (
    <Box sx={{ pb: 8 }}>
      <Box sx={{ height: 200, bgcolor: 'primary.main', mb: -10 }} />
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4, mb: 4, position: 'relative' }}>
          <Grid container spacing={4} alignItems="flex-end">
            <Grid size={{ xs: 12, md: 'auto' }}>
              <Avatar
                sx={{
                  width: 150,
                  height: 150,
                  border: '5px solid white',
                  bgcolor: 'secondary.main',
                  fontSize: '4rem',
                  boxShadow: 2
                }}
              >
                {profile?.name?.charAt(0) || 'U'}
              </Avatar>
            </Grid>
            <Grid size={{ xs: 12}}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="h3" fontWeight={800}>{profile.name}</Typography>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ color: 'text.secondary', mt: 1 }}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <EmailIcon fontSize="small" />
                    <Typography variant="body2">{profile.email}</Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Typography variant="body2">{profile?.friends?.length || 0} Friends</Typography>
                </Stack>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 'auto' }}>
              <Box sx={{ mb: 1, display: 'flex', gap: 2 }}>
                {!isOwnProfile && isAuthenticated && (
                  <>
                    {isFriend ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip icon={<FriendsIcon />} label="Friends" color="success" variant="outlined" />
                        <Button variant="text" color="error" size="small" onClick={handleRemoveFriend}>Unfriend</Button>
                      </Stack>
                    ) : hasReceivedRequest ? (
                      <Stack direction="row" spacing={1}>
                        <Button variant="contained" color="success" startIcon={<AcceptIcon />} onClick={() => handleResponse('accept')}>
                          Accept
                        </Button>
                        <Button variant="outlined" color="error" startIcon={<RejectIcon />} onClick={() => handleResponse('reject')}>
                          Reject
                        </Button>
                      </Stack>
                    ) : hasSentRequest ? (
                      <Chip label="Request Sent" color="info" />
                    ) : (
                      <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddFriend} sx={{ borderRadius: 2 }}>
                        Add Friend
                      </Button>
                    )}
                  </>
                )}
                {isOwnProfile && (
                  <Button variant="outlined" component={RouterLink} to="/dashboard" sx={{ borderRadius: 2 }}>
                    Manage Posts
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
            <Tab icon={<PostsIcon />} iconPosition="start" label={`Posts (${posts?.length})`} />
            <Tab icon={<FriendsIcon />} iconPosition="start" label={`Friends (${profile?.friends?.length || 0})`} />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <Grid container spacing={4}>
            {posts?.length > 0 ? (
              posts?.map((post) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post._id}>
                  <PostCard post={post} />
                </Grid>
              ))
            ) : (
              <Grid size={{ xs: 12 }}>
                <Box textAlign="center" py={10}>
                  <Typography color="text.secondary">No posts to display.</Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            {profile.friends?.length ?? 0 > 0 ? (
              profile.friends?.map((friend: any) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={friend._id || friend}>
                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>{friend.name?.charAt(0) || 'F'}</Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" component={RouterLink} to={`/profile/${friend._id || friend}`} sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { color: 'primary.main' } }}>
                          {friend.name || 'Friend'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{friend.email}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Box textAlign="center" py={10} width="100%">
                <Typography color="text.secondary">No friends yet.</Typography>
              </Box>
            )}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default UserProfile;