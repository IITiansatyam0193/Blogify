import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  OutlinedInput,
  Chip,
  Checkbox,
  ListItemText,
  Paper,
  Alert,
  CircularProgress,
  FormHelperText,
  Divider
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Save as SaveIcon,
  PostAdd as PostIcon,
  Palette as ThemeIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import IncomingRequestsSection from './IncomingRequestsSection';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const Dashboard: React.FC = () => {
  const { isAuthenticated, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const editId = searchParams.get('edit');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [scheduledAt, setScheduledAt] = useState('');
  const [mediaFiles, setMediaFiles] = useState<FileList | null>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState('');

  const [loadingForm, setLoadingForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/login');
    }
    if (isAuthenticated) {
      fetchCategories();
      fetchTags();
      fetchThemes();
      if (editId) {
        fetchPostData(editId);
      }
    }
  }, [isAuthenticated, authLoading, editId]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      const categoriesData = Array.isArray(res.data) ? res.data : (Array.isArray(res.data.data) ? res.data.data : []);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await axios.get('/api/tags');
      const tagsData = Array.isArray(res.data) ? res.data : (Array.isArray(res.data.data) ? res.data.data : []);
      setTags(tagsData);
    } catch (err) {
      console.error('Failed to fetch tags:', err);
      setTags([]);
    }
  };

  const fetchThemes = async () => {
    try {
      const res = await axios.get('/api/themes');
      const themesData = Array.isArray(res.data) ? res.data : (Array.isArray(res.data.data) ? res.data.data : []);
      setThemes(themesData);
    } catch (err) {
      console.error('Failed to fetch themes:', err);
      setThemes([]);
    }
  };

  const fetchPostData = async (postId: string) => {
    try {
      setLoadingForm(true);
      const res = await axios.get(`/api/posts/${postId}`);
      const post = res.data.data;
      setTitle(post.title);
      setContent(post.content);
      setStatus(post.status);
      setVisibility(post.visibility);
      if (post.scheduledAt) setScheduledAt(new Date(post.scheduledAt).toISOString().slice(0, 16));
      setSelectedCategories(post.categories.map((c: any) => c._id || c));
      setSelectedTags(post.tags.map((t: any) => t._id || t));
      if (post.theme) setSelectedThemeId(post.theme._id || post.theme);
    } catch (err) {
      setErrorMsg('Failed to load post data for editing.');
    } finally {
      setLoadingForm(false);
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedCategories(typeof value === 'string' ? value.split(',') : value);
  };

  const handleTagChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedTags(typeof value === 'string' ? value.split(',') : value);
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setMediaFiles(files && files.length > 0 ? files : null);
  };

  const handleActivateTheme = async () => {
    if (!selectedThemeId) return;
    try {
      await axios.patch(`/api/themes/${selectedThemeId}/activate`);
      setSuccessMsg('Theme activated globally for your blog!');
    } catch (err) {
      setErrorMsg('Failed to activate theme.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setErrorMsg('Title and content are required.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('status', status);
      formData.append('visibility', visibility);
      if (selectedThemeId) formData.append('themeId', selectedThemeId);

      selectedCategories.forEach(id => formData.append('categories', id));
      selectedTags.forEach(id => formData.append('tags', id));

      if (status === 'scheduled' && scheduledAt) {
        formData.append('scheduledAt', new Date(scheduledAt).toISOString());
      }

      if (mediaFiles) {
        Array.from(mediaFiles).forEach((file) => {
          formData.append('media', file);
        });
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      if (editId) {
        await axios.put(`/api/posts/${editId}`, formData, config);
        setSuccessMsg('Blog post updated successfully.');
      } else {
        await axios.post('/api/posts', formData, config);
        setSuccessMsg('Blog post created successfully.');
        // Reset form for new post
        setTitle('');
        setContent('');
        setStatus('draft');
        setVisibility('public');
        setScheduledAt('');
        setSelectedCategories([]);
        setSelectedTags([]);
        setSelectedThemeId('');
        setMediaFiles(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || `Failed to ${editId ? 'update' : 'create'} blog post.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loadingForm) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <Box sx={{ py: 6, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Typography variant="h3" fontWeight={700} gutterBottom>
          {editId ? 'Edit Post' : 'Dashboard'}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          {editId ? `Refining your story: ${title}` : 'Create and manage your blog posts.'}
        </Typography>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                {editId ? <SaveIcon color="primary" /> : <PostIcon color="primary" />}
                {editId ? 'Update Post Content' : 'Write New Post'}
              </Typography>

              {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}
              {successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Title"
                  placeholder="Enter blog title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  sx={{ mb: 3 }}
                />

                <TextField
                  fullWidth
                  label="Content"
                  placeholder="Write your blog content (HTML or plain text)"
                  multiline
                  rows={10}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  sx={{ mb: 3 }}
                />

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Categories</InputLabel>
                      <Select
                        multiple
                        value={selectedCategories}
                        onChange={handleCategoryChange}
                        input={<OutlinedInput label="Categories" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={categories.find(c => c._id === value)?.name || value} size="small" />
                            ))}
                          </Box>
                        )}
                        MenuProps={MenuProps}
                      >
                        {categories.map((cat) => (
                          <MenuItem key={cat._id} value={cat._id}>
                            <Checkbox checked={selectedCategories.indexOf(cat._id) > -1} />
                            <ListItemText primary={cat.name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Tags</InputLabel>
                      <Select
                        multiple
                        value={selectedTags}
                        onChange={handleTagChange}
                        input={<OutlinedInput label="Tags" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={tags.find(t => t._id === value)?.name || value} size="small" />
                            ))}
                          </Box>
                        )}
                        MenuProps={MenuProps}
                      >
                        {tags.map((tag) => (
                          <MenuItem key={tag._id} value={tag._id}>
                            <Checkbox checked={selectedTags.indexOf(tag._id) > -1} />
                            <ListItemText primary={tag.name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        label="Status"
                      >
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                        <MenuItem value="scheduled">Scheduled</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>Visibility</InputLabel>
                      <Select
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value as any)}
                        label="Visibility"
                      >
                        <MenuItem value="public">Public</MenuItem>
                        <MenuItem value="friends">Friends</MenuItem>
                        <MenuItem value="private">Private</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>Theme/Design</InputLabel>
                      <Select
                        value={selectedThemeId}
                        onChange={(e) => setSelectedThemeId(e.target.value)}
                        label="Theme/Design"
                      >
                        <MenuItem value="">Default Theme</MenuItem>
                        {themes?.map((t) => (
                          <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {status === 'scheduled' && (
                  <TextField
                    fullWidth
                    label="Scheduled Date & Time"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 3 }}
                    helperText="Blog will be published automatically at this time."
                  />
                )}

                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Multimedia (Images/Videos)
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<UploadIcon />}
                    sx={{ py: 3, borderStyle: 'dashed', borderRadius: 2 }}
                  >
                    {mediaFiles ? `${mediaFiles.length} files selected` : 'Click to upload media'}
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*,video/*"
                      onChange={handleMediaChange}
                      ref={fileInputRef}
                    />
                  </Button>
                  <FormHelperText>Images and videos only. New uploads will append to existing media if editing.</FormHelperText>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {selectedThemeId && (
                    <Button
                      variant="text"
                      color="secondary"
                      startIcon={<ThemeIcon />}
                      onClick={handleActivateTheme}
                    >
                      Apply Theme Globally
                    </Button>
                  )}
                  <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
                    {editId && (
                      <Button variant="outlined" color="inherit" onClick={() => navigate('/dashboard')}>
                        Cancel Edit
                      </Button>
                    )}
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting}
                      sx={{ px: 6, py: 1.5, borderRadius: 2 }}
                    >
                      {submitting ? <CircularProgress size={24} color="inherit" /> : (editId ? 'Update Post' : 'Publish Blog')}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Writing Tips
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box component="ul" sx={{ pl: 2, '& li': { mb: 1.5 } }}>
                <Typography component="li" variant="body2" color="text.secondary">Use clear titles and rich content.</Typography>
                <Typography component="li" variant="body2" color="text.secondary">Attach images/videos to make posts engaging.</Typography>
                <Typography component="li" variant="body2" color="text.secondary">Use Friends visibility for private sharing.</Typography>
                <Typography component="li" variant="body2" color="text.secondary">Categories help readers navigate your content.</Typography>
                <Typography component="li" variant="body2" color="text.secondary">Themes allow you to customize the look of your stories.</Typography>
              </Box>
            </Paper>

            <Box sx={{ mt: 2 }}>
              <IncomingRequestsSection />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
