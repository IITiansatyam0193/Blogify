import React, { useState, useEffect, useRef } from 'react';
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
  Chip
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ArrowBack as BackIcon,
  CalendarToday as DateIcon,
  Person as AuthorIcon
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
    }
  }, [id]);

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
      const response = await axios.get(`/api/posts/${postId}`);
      setPost(response.data.data);
      fetchComments(postId);
    } catch (err: any) {
      if (err.response?.status === 404) setError('Post not found');
      else if (err.response?.status === 403) setError('You do not have permission to view this post');
      else setError('Failed to load post');
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
      await axios.post('/api/comments', {
        postId: post._id,
        content: commentContent,
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
      await axios.put(`/api/comments/${commentId}`, { content: editCommentContent });
      setEditingCommentId(null);
      fetchComments(post!._id);
    } catch (err) {
      console.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await axios.delete(`/api/comments/${commentId}`);
      fetchComments(post!._id);
    } catch (err) {
      console.error('Failed to delete comment');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, commentId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedCommentId(commentId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCommentId(null);
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress /></Box>;
  }

  if (error || !post) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Alert severity="error" action={<Button component={RouterLink} to="/" color="inherit" size="small">Home</Button>}>
          {error || 'Post not found'}
        </Alert>
      </Container>
    );
  }

  const isAuthor = currentUser?._id === post.author._id;

  return (
    <Box sx={{ pb: 10 }}>
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
          {/* Main Content */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Box component="article">
              <Typography variant="h2" component="h1" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '3.75rem' } }}>
                {post.title}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>{post.author.name.charAt(0)}</Avatar>
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
                <Chip label={post.visibility} size="small" color="info" variant="outlined" />
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
                    <video
                      src={`http://localhost:5000${post.media[0].path}`}
                      controls
                      style={{ width: '100%', maxHeight: '600px', display: 'block' }}
                    />
                  )}
                </Box>
              )}

              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.8,
                  fontSize: '1.125rem',
                  '& blockquote': { borderLeft: '4px solid', borderColor: 'primary.main', pl: 2, fontStyle: 'italic', my: 3 },
                  '& img': { maxWidth: '100%', borderRadius: 2 }
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

              {/* Comments Section */}
              <Typography variant="h5" fontWeight={700} sx={{ mb: 4 }}>
                Comments ({comments.length})
              </Typography>

              {isAuthenticated ? (
                <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: 'grey.50' }} elevation={0}>
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
                    <Button type="submit" variant="contained" sx={{ mt: 2, px: 4, borderRadius: 2 }}>
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
                  <Card key={comment._id} elevation={0} sx={{ mb: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '1rem' }}>
                            {comment.author.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>{comment.author.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(comment.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>

                        {(currentUser?._id === comment.author._id || isAuthor) && (
                          <Box>
                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, comment._id)}>
                              <MoreIcon />
                            </IconButton>
                          </Box>
                        )}
                      </Box>

                      {editingCommentId === comment._id ? (
                        <Box sx={{ mt: 1 }}>
                          <TextField
                            fullWidth
                            multiline
                            value={editCommentContent}
                            onChange={(e) => setEditCommentContent(e.target.value)}
                            sx={{ mb: 1 }}
                          />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button size="small" variant="contained" onClick={() => handleUpdateComment(comment._id)}>Save</Button>
                            <Button size="small" variant="text" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ my: 1 }}>{comment.content}</Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                {selectedCommentId && comments.find(c => c._id === selectedCommentId)?.author._id === currentUser?._id && (
                  <MenuItem onClick={() => {
                    handleMenuClose();
                    setEditingCommentId(selectedCommentId);
                    setEditCommentContent(comments.find(c => c._id === selectedCommentId).content);
                  }}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                  </MenuItem>
                )}
                <MenuItem onClick={() => {
                  handleMenuClose();
                  handleDeleteComment(selectedCommentId!);
                }} sx={{ color: 'error.main' }}>
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
                </MenuItem>
              </Menu>
            </Box>
          </Grid>

          {/* Sidebar */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'grey.200', mb: 4, position: 'sticky', top: 24 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Author Info</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem' }}>{post.author.name.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="h6">{post.author.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Blogger</Typography>
                </Box>
              </Box>
              <Button fullWidth variant="outlined" component={RouterLink} to={`/profile/${post.author._id}`} sx={{ borderRadius: 2 }}>
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
                    sx={{ borderRadius: 2 }}
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
