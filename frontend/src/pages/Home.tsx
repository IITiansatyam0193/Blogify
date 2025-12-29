import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search as SearchIcon } from '@mui/icons-material';
import PostCard from '../components/PostCard';
import { Post } from '../types';
import { useAuth } from '../hooks/useAuth';

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (keyword: string = '') => {
    try {
      setLoading(true);
      setError('');
      const params: any = { page: 1, limit: 9 };
      if (keyword) params.keyword = keyword;
      
      const response = await axios.get('/api/posts', { params });
      setPosts(response.data.data);
    } catch (err: any) {
      setError('Failed to load posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts(searchTerm);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="bg-light py-5">
        <div className='container'>
          <div className="row justify-content-center text-center">
            <div className="col-md-8">
              <h1 className="display-4 fw-bold mb-4">Welcome to Blogify</h1>
              <p className="lead mb-4">
                Discover amazing stories, share your thoughts, and connect with fellow bloggers.
              </p>
              {isAuthenticated ? (
                <a href='/dashboard' className="btn btn-lg me-3">
                  Create Your Blog
                </a>
              ) : (
                <a href='/login' className="btn btn-primary btn-lg">
                  Get Started
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-5 bg-white">
        <div className='container'>
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <form onSubmit={handleSearch} className="d-flex">
                    <div className="input-group input-group-lg flex-grow-1">
                      <span className="input-group-text bg-white border-end-0">
                        <SearchIcon />
                      </span>
                      <input
                        type="text"
                        placeholder="Search posts by title, content, categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-control border-start-0"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg ms-2">
                      Search
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-5">
        <div className='container'>
          {error && (
            <div className="alert alert-danger text-center mb-4">
              {error}
            </div>
          )}
          
          <div className="row g-4">
            {posts.length === 0 ? (
              <div className="col-md-12">
                <div className="text-center py-5">
                  <h3>No posts found</h3>
                  <p>Try searching with different keywords</p>
                </div>
              </div>
            ) : (
              posts.map((post) => (
                <div className="col-md-4" key={post._id}>
                  <PostCard post={post} />
                </div>
              ))
            )}
          </div>

          {posts.length > 0 && (
            <div className="text-center mt-5">
              <button className="btn btn-outline-primary btn-lg">
                Load More Posts
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Home;
