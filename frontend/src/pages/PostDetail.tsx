import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Divider,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Breadcrumbs,
  Link,
  Chip,
  Stack
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ArrowBack as BackIcon,
  CalendarToday as DateIcon,
  Lock as LockIcon,
  PersonAdd as FriendIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { Post } from '../types';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [restrictedAuthorId, setRestrictedAuthorId] = useState<string | null>(null);

  const [commentContent, setCommentContent] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

  const viewTracked = useRef(false);

  useEffect(() => {
    if (id) {
      fetchPost(id);
      if (!viewTracked.current) {
        trackView(id);
        viewTracked.current = true;
      }
    } else {
      setPost(null);
    }
  }, [id, token]);

  const trackView = async (postId: string) => {
    try {
      await axios.post(`/api/analytics/track/${postId}`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (err) {
      console.error('Failed to track view');
    }
  };

  const fetchPost = async (postId: string) => {
    try {
      setLoading(true);
      setError('');
      setRestrictedAuthorId(null);
      const response = await axios.get(`/api/posts/${postId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setPost(response.data.data);
      fetchComments(postId);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError(err.response.data.message || 'This post is restricted.');
        setRestrictedAuthorId(err.response.data.authorId || null);
      } else if (err.response?.status === 404) {
        setError('Post not found');
      } else {
        setError('Failed to load post');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const response = await axios.get(`/api/comments/post/${postId}`);
      setComments(response.data.data);
    } catch (err) {
      console.error('Failed to fetch comments');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !post || !isAuthenticated) return;
    try {
      await axios.post('/api/comments', { postId: post._id, content: commentContent }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommentContent('');
      fetchComments(post._id);
    } catch (err) {
      console.error('Failed to post comment');
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editCommentContent.trim()) return;
    try {
      await axios.put(`/api/comments/${commentId}`, { content: editCommentContent }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingCommentId(null);
      fetchComments(post!._id);
    } catch (err) {
      console.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await axios.delete(`/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComments(post!._id);
    } catch (err) {
      console.error('Failed to delete comment');
    }
  };

  const themeStyles = useMemo(() => {
    if (!post?.themeId) return {};
    const { colors, fonts } = post.themeId;
    return {
      '--theme-primary': colors.primary,
      '--theme-secondary': colors.secondary,
      '--theme-background': colors.background,
      '--theme-surface': colors.surface,
      '--theme-font-heading': fonts.heading,
      '--theme-font-body': fonts.body,
    } as React.CSSProperties;
  }, [post]);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;

  if (error && !post) {
    const isRestricted = error.includes('restricted');
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Paper elevation={3} sx={{ p: 5, borderRadius: 4, textAlign: 'center' }}>
          {isRestricted ? (
            <>
              <LockIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
              <Typography variant="h4" fontWeight={700} gutterBottom>Access Denied</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {error}
              </Typography>
              <Stack spacing={2}>
                {restrictedAuthorId && isAuthenticated && (
                  <Button
                    variant="contained"
                    startIcon={<FriendIcon />}
                    component={RouterLink}
                    to={`/profile/${restrictedAuthorId}`}
                    sx={{ borderRadius: 2 }}
                  >
                    View Author Profile
                  </Button>
                )}
                <Button variant="outlined" component={RouterLink} to="/" startIcon={<BackIcon />} sx={{ borderRadius: 2 }}>
                  Go Back Home
                </Button>
              </Stack>
            </>
          ) : (
            <>
              <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
              <Button component={RouterLink} to="/" variant="contained">Back to Home</Button>
            </>
          )}
        </Paper>
      </Container>
    );
  }

  if (!post) return null;

  const isAuthor = currentUser?._id === post.author._id;

  return (
    <Box sx={{ pb: 10, ...themeStyles, bgcolor: 'var(--theme-background, inherit)' }}>
      {/* Breadcrumbs */}
      <Box sx={{ bgcolor: 'grey.50', py: 2, borderBottom: '1px solid', borderColor: 'grey.200', mb: 4 }}>
        <Container maxWidth="lg">
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" component={RouterLink} to="/">Home</Link>
            <Typography color="text.primary">{post.title}</Typography>
          </Breadcrumbs>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Grid container spacing={5}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Box
              component="article"
              sx={{
                color: 'text.primary',
                '& h1, & h2, & h3, & h4, & h5, & h6': { fontFamily: 'var(--theme-font-heading, inherit)' },
                fontFamily: 'var(--theme-font-body, inherit)'
              }}
            >
              <Typography variant="h2" component="h1" fontWeight={800} gutterBottom sx={{
                fontSize: { xs: '2.5rem', md: '3.75rem' },
                color: 'var(--theme-primary, inherit)'
              }}>
                {post.title}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'var(--theme-primary, #1976d2)' }}>{post.author.name.charAt(0)}</Avatar>
                  <Typography variant="subtitle2" fontWeight={600}>{post.author.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                  <DateIcon fontSize="small" />
                  <Typography variant="body2">{new Date(post.createdAt).toLocaleDateString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                  <ViewIcon fontSize="small" />
                  <Typography variant="body2">{post.views} views</Typography>
                </Box>
                <Chip label={post.visibility} size="small" variant="outlined" sx={{ borderColor: 'var(--theme-secondary, #ccc)' }} />
                {post.status === 'draft' && <Chip label="Draft" size="small" color="warning" />}
              </Box>

              {post.media.length > 0 && (
                <Box sx={{ mb: 5, borderRadius: 4, overflow: 'hidden', boxShadow: 3 }}>
                  {post.media[0].type === 'image' ? (
                    <img
                      src={`http://localhost:5000${post.media[0].path}`}
                      alt="Cover"
                      style={{ width: '100%', maxHeight: '600px', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <video src={`http://localhost:5000${post.media[0].path}`} controls style={{ width: '100%', maxHeight: '600px', display: 'block' }} />
                  )}
                </Box>
              )}

              <Box
                sx={{
                  lineHeight: 1.8,
                  fontSize: '1.125rem',
                  '& blockquote': { borderLeft: '4px solid', borderColor: 'var(--theme-primary, #1976d2)', pl: 2, fontStyle: 'italic', my: 3 },
                  '& img': { maxWidth: '100%', borderRadius: 2 },
                  '& a': { color: 'var(--theme-primary, #1976d2)' }
                }}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Additional Media */}
              {post.media.slice(1).map((media, index) => (
                <Box key={index} sx={{ mt: 4, borderRadius: 2, overflow: 'hidden' }}>
                  {media.type === 'image' ? (
                    <img src={`http://localhost:5000${media.path}`} alt="" style={{ width: '100%', height: 'auto' }} />
                  ) : (
                    <video src={`http://localhost:5000${media.path}`} controls style={{ width: '100%' }} />
                  )}
                </Box>
              ))}

              <Divider sx={{ my: 6 }} />

              <Typography variant="h5" fontWeight={700} sx={{ mb: 4 }}>
                Comments ({comments.length})
              </Typography>

              {isAuthenticated ? (
                <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: 'var(--theme-surface, #f9f9f9)' }} elevation={0}>
                  <Box component="form" onSubmit={handleCommentSubmit}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Share your thoughts..."
                      variant="outlined"
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      sx={{ bgcolor: 'white' }}
                    />
                    <Button type="submit" variant="contained" sx={{ mt: 2, px: 4, borderRadius: 2, bgcolor: 'var(--theme-primary, #1976d2)' }}>
                      Post Comment
                    </Button>
                  </Box>
                </Paper>
              ) : (
                <Alert severity="info" sx={{ mb: 4 }}>
                  Please <Link component={RouterLink} to="/login">login</Link> to join the conversation.
                </Alert>
              )}

              <Box>
                {comments.map((comment) => (
                  <Card key={comment._id} elevation={0} sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'var(--theme-surface, #fff)' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'var(--theme-secondary, #dc004e)', fontSize: '1rem' }}>
                            {comment.author.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>{comment.author.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(comment.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ my: 1 }}>{comment.content}</Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', mb: 4, position: 'sticky', top: 24, bgcolor: 'var(--theme-surface, #fff)' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Author Info</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'var(--theme-primary, #1976d2)', fontSize: '1.5rem' }}>{post.author.name.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="h6">{post.author.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Blogger</Typography>
                </Box>
              </Box>
              <Button fullWidth variant="outlined" component={RouterLink} to={`/profile/${post.author._id}`} sx={{ borderRadius: 2, borderColor: 'var(--theme-primary, #1976d2)', color: 'var(--theme-primary, #1976d2)' }}>
                View Full Profile
              </Button>

              <Divider sx={{ my: 4 }} />

              <Typography variant="h6" fontWeight={700} gutterBottom>Post Actions</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                {isAuthor && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/dashboard?edit=${post._id}`)}
                    sx={{ borderRadius: 2, bgcolor: 'var(--theme-primary, #1976d2)' }}
                  >
                    Edit Post
                  </Button>
                )}
                <Button fullWidth variant="text" startIcon={<BackIcon />} component={RouterLink} to="/" sx={{ borderRadius: 2 }}>
                  Back to Discover
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PostDetail;
