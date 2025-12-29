import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';
import PostCard from '../components/PostCard';
import { Post } from '../types';
import { useAuth } from '../hooks/useAuth';

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedTagId, setSelectedTagId] = useState('');

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchCategories();
    fetchTags();
    fetchPosts(1, '', '', '');
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchTags = async () => {
    try {
      const res = await axios.get('/api/tags');
      setTags(res.data.data);
    } catch (err) {
      console.error('Failed to fetch tags');
    }
  };

  const fetchPosts = async (pageNumber: number, keyword: string = '', catId: string = '', tagId: string = '', isLoadMore: boolean = false) => {
    try {
      if (isLoadMore) setLoadMoreLoading(true);
      else if (pageNumber === 1) setLoading(true);

      setError('');

      // Use search endpoint if any filter is present
      const endpoint = (keyword || catId || tagId) ? '/api/posts/search' : '/api/posts';

      const params: any = { page: pageNumber, limit: 9 };
      if (keyword) params.keyword = keyword;
      if (catId) params.categoryId = catId;
      if (tagId) params.tagId = tagId;

      const response = await axios.get(endpoint, { params });
      const newPosts = response.data.data;

      if (pageNumber === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }

      setHasMore(newPosts.length === 9);
    } catch (err: any) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadMoreLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts(1, searchTerm, selectedCategoryId, selectedTagId);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, searchTerm, selectedCategoryId, selectedTagId, true);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategoryId('');
    setSelectedTagId('');
    setPage(1);
    fetchPosts(1, '', '', '');
  };

  if (loading && page === 1) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 8 }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'grey.50',
          py: 10,
          textAlign: 'center',
          borderBottom: '1px solid',
          borderColor: 'grey.200'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '3.75rem' } }}>
            Welcome to Blogify
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
            Discover amazing stories, share your thoughts, and connect with fellow bloggers.
          </Typography>
          {!isAuthenticated && (
            <Button
              component={Link}
              to="/register"
              variant="contained"
              size="large"
              sx={{ px: 4, py: 1.5, borderRadius: 2 }}
            >
              Get Started
            </Button>
          )}
        </Container>
      </Box>

      {/* Search & Filters Section */}
      <Container maxWidth="lg" sx={{ mt: -6 }}>
        <Paper
          elevation={4}
          sx={{
            p: 3,
            borderRadius: 4,
            backgroundColor: 'common.white'
          }}
        >
          <Box component="form" onSubmit={handleSearch}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  fullWidth
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategoryId}
                    label="Category"
                    onChange={(e: SelectChangeEvent) => setSelectedCategoryId(e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                <FormControl fullWidth>
                  <InputLabel>Tag</InputLabel>
                  <Select
                    value={selectedTagId}
                    label="Tag"
                    onChange={(e: SelectChangeEvent) => setSelectedTagId(e.target.value)}
                  >
                    <MenuItem value="">All Tags</MenuItem>
                    {tags.map((tag) => (
                      <MenuItem key={tag._id} value={tag._id}>{tag.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ height: '56px', borderRadius: 2 }}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
            {(selectedCategoryId || selectedTagId || searchTerm) && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button size="small" onClick={resetFilters} startIcon={<FilterIcon />}>
                  Clear Filters
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Posts Grid */}
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 4, justifyContent: 'center' }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {posts.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Box textAlign="center" py={10}>
                <Typography variant="h4" color="text.secondary" gutterBottom>
                  No posts found
                </Typography>
                <Typography color="text.secondary">
                  Try adjusting your search or filters
                </Typography>
                <Button onClick={resetFilters} sx={{ mt: 2 }}>Show All Posts</Button>
              </Box>
            </Grid>
          ) : (
            posts.map((post) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post._id}>
                <PostCard post={post} />
              </Grid>
            ))
          )}
        </Grid>

        {hasMore && posts.length > 0 && (
          <Box textAlign="center" mt={8}>
            <Button
              onClick={handleLoadMore}
              variant="outlined"
              size="large"
              disabled={loadMoreLoading}
              sx={{ px: 6, borderRadius: 2 }}
            >
              {loadMoreLoading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
              {loadMoreLoading ? 'Loading...' : 'Load More Stories'}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Home;
