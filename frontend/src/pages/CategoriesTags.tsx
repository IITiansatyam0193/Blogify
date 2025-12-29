import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Fab,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Divider,
  Stack,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Merge as MergeIcon,
  Palette as ThemeIcon,
  Category as CategoryIcon,
  LocalOffer as TagIcon,
  CheckCircle as ActiveIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Tag {
  _id: string;
  name: string;
  slug: string;
}

interface Theme {
  _id: string;
  name: string;
  isActive: boolean;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

const CategoriesTags: React.FC = () => {
  const { isAuthenticated, loading: authLoading, token, updateActiveTheme } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [openMerge, setOpenMerge] = useState(false);
  const [openThemeForm, setOpenThemeForm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState<'category' | 'tag' | 'theme'>('category');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Form states
  const [categoryName, setCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [tagName, setTagName] = useState('');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const [sourceTagId, setSourceTagId] = useState('');
  const [targetTagId, setTargetTagId] = useState('');

  const [themeData, setThemeData] = useState({
    name: '',
    primary: '#1976d2',
    secondary: '#dc004e',
    background: '#ffffff',
    surface: '#f5f5f5',
    headingFont: 'Roboto',
    bodyFont: 'Roboto'
  });
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/login');
    }
    fetchData();
  }, [isAuthenticated, authLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, tagRes, themeRes] = await Promise.all([
        axios.get('/api/categories'),
        axios.get('/api/tags'),
        axios.get('/api/themes', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const categoriesData = Array.isArray(catRes.data) ? catRes.data : (Array.isArray(catRes.data.data) ? catRes.data.data : []);
      const tagsData = Array.isArray(tagRes.data) ? tagRes.data : (Array.isArray(tagRes.data.data) ? tagRes.data.data : []);

      setCategories(categoriesData);
      setTags(tagsData);

      if (themeRes.data.success) {
        setThemes(themeRes.data.data.themes || []);
        setActiveTheme(themeRes.data.data.activeTheme || null);
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Category Handlers
  const handleSaveCategory = async () => {
    if (!categoryName.trim()) return;
    try {
      setLoading(true);
      if (editingCategory) {
        await axios.put(`/api/categories/${editingCategory._id}`, { name: categoryName });
        setSuccess('Category updated');
      } else {
        await axios.post('/api/categories', { name: categoryName });
        setSuccess('Category created');
      }
      setCategoryName('');
      setEditingCategory(null);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  // Tag Handlers
  const handleSaveTag = async () => {
    if (!tagName.trim()) return;
    try {
      setLoading(true);
      if (editingTag) {
        await axios.put(`/api/tags/${editingTag._id}`, { name: tagName });
        setSuccess('Tag updated');
      } else {
        await axios.post('/api/tags', { name: tagName });
        setSuccess('Tag created');
      }
      setTagName('');
      setEditingTag(null);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMergeTags = async () => {
    if (!sourceTagId || !targetTagId || sourceTagId === targetTagId) {
      setError('Select distinct source and target tags');
      return;
    }
    try {
      setLoading(true);
      await axios.post('/api/tags/merge', { sourceId: sourceTagId, targetId: targetTagId });
      setSuccess('Tags merged successfully');
      setOpenMerge(false);
      setSourceTagId('');
      setTargetTagId('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Merge failed');
    } finally {
      setLoading(false);
    }
  };

  // Theme Handlers
  const handleOpenThemeForm = (theme?: Theme) => {
    if (theme) {
      setEditingTheme(theme);
      setThemeData({
        name: theme.name,
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        background: theme.colors.background,
        surface: theme.colors.surface,
        headingFont: theme.fonts.heading,
        bodyFont: theme.fonts.body
      });
    } else {
      setEditingTheme(null);
      setThemeData({
        name: '',
        primary: '#1976d2',
        secondary: '#dc004e',
        background: '#ffffff',
        surface: '#f5f5f5',
        headingFont: 'Roboto',
        bodyFont: 'Roboto'
      });
    }
    setOpenThemeForm(true);
  };

  const handleSaveTheme = async () => {
    if (!themeData.name.trim()) return;
    const body = {
      name: themeData.name,
      colors: {
        primary: themeData.primary,
        secondary: themeData.secondary,
        background: themeData.background,
        surface: themeData.surface
      },
      fonts: {
        heading: themeData.headingFont,
        body: themeData.bodyFont
      }
    };

    try {
      setLoading(true);
      if (editingTheme) {
        await axios.put(`/api/themes/${editingTheme._id}`, body, { headers: { Authorization: `Bearer ${token}` } });
        setSuccess('Theme updated');
      } else {
        await axios.post('/api/themes', body, { headers: { Authorization: `Bearer ${token}` } });
        setSuccess('Theme created');
      }
      setOpenThemeForm(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Theme action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateTheme = async (id: string, theme: Theme) => {
    try {
      setLoading(true);
      await axios.patch(`/api/themes/${id}/activate`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Theme activated');
      updateActiveTheme(theme);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Activation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      setLoading(true);
      if (deleteType === 'category') await axios.delete(`/api/categories/${itemToDelete}`);
      if (deleteType === 'tag') await axios.delete(`/api/tags/${itemToDelete}`);
      if (deleteType === 'theme') await axios.delete(`/api/themes/${itemToDelete}`, { headers: { Authorization: `Bearer ${token}` } });

      setSuccess(`${deleteType.charAt(0).toUpperCase() + deleteType.slice(1)} deleted`);
      setOpenDeleteConfirm(false);
      setItemToDelete(null);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" fontWeight={800} gutterBottom>
        Management Hub
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Organize your content with categories and tags, or customize your blog's visual identity.
      </Typography>

      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 4 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 4 }}>{success}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          <Tab icon={<CategoryIcon />} iconPosition="start" label="Categories" />
          <Tab icon={<TagIcon />} iconPosition="start" label="Tags" />
          <Tab icon={<ThemeIcon />} iconPosition="start" label="Themes" />
        </Tabs>
      </Box>

      {/* Categories Content */}
      {activeTab === 0 && (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </Typography>
              <TextField
                fullWidth
                label="Category Name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                sx={{ mb: 2 }}
                disabled={loading}
              />
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSaveCategory}
                  disabled={loading || !categoryName.trim()}
                >
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
                {editingCategory && (
                  <Button variant="outlined" onClick={() => { setEditingCategory(null); setCategoryName(''); }}>
                    Cancel
                  </Button>
                )}
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              <List disablePadding>
                {categories.map((cat, idx) => (
                  <React.Fragment key={cat._id}>
                    <ListItem sx={{ py: 2 }}>
                      <ListItemText
                        primary={cat.name}
                        secondary={cat.slug}
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton size="small" onClick={() => { setEditingCategory(cat); setCategoryName(cat.name); }} sx={{ mr: 1 }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => { setDeleteType('category'); setItemToDelete(cat._id); setOpenDeleteConfirm(true); }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {idx < categories.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
                {categories.length === 0 && (
                  <Box p={4} textAlign="center">
                    <Typography color="text.secondary">No categories found.</Typography>
                  </Box>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tags Content */}
      {activeTab === 1 && (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', mb: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {editingTag ? 'Edit Tag' : 'Create New Tag'}
              </Typography>
              <TextField
                fullWidth
                label="Tag Name"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                sx={{ mb: 2 }}
                disabled={loading}
              />
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  onClick={handleSaveTag}
                  disabled={loading || !tagName.trim()}
                >
                  {editingTag ? 'Update' : 'Create'}
                </Button>
                {editingTag && (
                  <Button variant="outlined" onClick={() => { setEditingTag(null); setTagName(''); }}>
                    Cancel
                  </Button>
                )}
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'primary.50' }}>
              <Typography variant="h6" fontWeight={700} display="flex" alignItems="center" gap={1} gutterBottom>
                <MergeIcon color="primary" /> Tag Maintenance
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Consolidate similar tags by merging them into one. Posts will be updated automatically.
              </Typography>
              <Button variant="outlined" fullWidth onClick={() => setOpenMerge(true)}>
                Merge Tags
              </Button>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag._id}
                    label={tag.name}
                    variant="outlined"
                    onDelete={() => { setDeleteType('tag'); setItemToDelete(tag._id); setOpenDeleteConfirm(true); }}
                    onClick={() => { setEditingTag(tag); setTagName(tag.name); }}
                    deleteIcon={<DeleteIcon />}
                    sx={{ borderRadius: 2, px: 1 }}
                  />
                ))}
                {tags.length === 0 && (
                  <Box p={4} textAlign="center" width="100%">
                    <Typography color="text.secondary">No tags found.</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Themes Content */}
      {activeTab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h6" fontWeight={700}>Your Blog Themes</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenThemeForm()}>
              Create Theme
            </Button>
          </Box>

          <Grid container spacing={3}>
            {themes.map((theme) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={theme._id}>
                <Card sx={{ borderRadius: 4, height: '100%', position: 'relative', border: theme.isActive ? '2px solid' : '1px solid', borderColor: theme.isActive ? 'primary.main' : 'divider' }}>
                  {theme.isActive && (
                    <Chip
                      label="Active"
                      color="primary"
                      size="small"
                      icon={<ActiveIcon />}
                      sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}
                    />
                  )}
                  <Box sx={{ height: 10, bgcolor: theme.colors.primary }} />
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} noWrap gutterBottom>{theme.name}</Typography>
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: theme.colors.primary, border: '1px solid divider' }} />
                        <Typography variant="caption">Primary</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: theme.colors.secondary, border: '1px solid divider' }} />
                        <Typography variant="caption">Secondary</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">Fonts: {theme.fonts.heading} / {theme.fonts.body}</Typography>
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpenThemeForm(theme)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      {!theme.isActive && (
                        <IconButton size="small" color="error" onClick={() => { setDeleteType('theme'); setItemToDelete(theme._id); setOpenDeleteConfirm(true); }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    {!theme.isActive ? (
                      <Button size="small" variant="outlined" onClick={() => handleActivateTheme(theme._id, theme)}>Activate</Button>
                    ) : (
                      <Typography variant="caption" color="primary" fontWeight={700}>Active Preference</Typography>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
            {themes.length === 0 && (
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, border: '2px dashed', borderColor: 'divider' }}>
                  <Typography color="text.secondary">Create your first theme to personalize your blog!</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {/* Merge Modal */}
      <Dialog open={openMerge} onClose={() => setOpenMerge(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Merge Tags</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            All posts with the source tag will be updated to the target tag, and the source tag will be deleted.
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Source Tag (To Delete)</InputLabel>
            <Select value={sourceTagId} label="Source Tag (To Delete)" onChange={(e) => setSourceTagId(e.target.value)}>
              {tags.map((t) => (
                <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Target Tag (To Keep)</InputLabel>
            <Select value={targetTagId} label="Target Tag (To Keep)" onChange={(e) => setTargetTagId(e.target.value)}>
              {tags.filter(t => t._id !== sourceTagId).map((t) => (
                <MenuItem key={t._id} value={t._id}>{t.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenMerge(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleMergeTags} disabled={loading || !sourceTagId || !targetTagId}>
            Confirm Merge
          </Button>
        </DialogActions>
      </Dialog>

      {/* Theme Form Modal */}
      <Dialog open={openThemeForm} onClose={() => setOpenThemeForm(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>{editingTheme ? 'Edit Theme' : 'Create New Theme'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Theme Name"
                value={themeData.name}
                onChange={(e) => setThemeData({ ...themeData, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                type="color"
                label="Primary Color"
                value={themeData.primary}
                onChange={(e) => setThemeData({ ...themeData, primary: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                type="color"
                label="Secondary Color"
                value={themeData.secondary}
                onChange={(e) => setThemeData({ ...themeData, secondary: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                type="color"
                label="Background"
                value={themeData.background}
                onChange={(e) => setThemeData({ ...themeData, background: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                type="color"
                label="Surface/Card"
                value={themeData.surface}
                onChange={(e) => setThemeData({ ...themeData, surface: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Heading Font</InputLabel>
                <Select value={themeData.headingFont} label="Heading Font" onChange={(e) => setThemeData({ ...themeData, headingFont: e.target.value })}>
                  <MenuItem value="Roboto">Roboto</MenuItem>
                  <MenuItem value="Inter">Inter</MenuItem>
                  <MenuItem value="Outfit">Outfit</MenuItem>
                  <MenuItem value="Playfair Display">Playfair Display</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Body Font</InputLabel>
                <Select value={themeData.bodyFont} label="Body Font" onChange={(e) => setThemeData({ ...themeData, bodyFont: e.target.value })}>
                  <MenuItem value="Roboto">Roboto</MenuItem>
                  <MenuItem value="Open Sans">Open Sans</MenuItem>
                  <MenuItem value="Lato">Lato</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenThemeForm(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTheme} disabled={loading || !themeData.name.trim()}>
            Save Theme
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
        <DialogTitle display="flex" alignItems="center" gap={1}>
          <WarningIcon color="error" /> Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this {deleteType}? This action cannot be undone.</Typography>
          {deleteType !== 'theme' && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              Note: You cannot delete items currently associated with posts.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDeleteConfirm(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteItem} disabled={loading}>
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CategoriesTags;
