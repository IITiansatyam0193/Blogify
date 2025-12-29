import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Spinner, Form } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { Post } from '../types';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, isAuthenticated } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchPost(id);
    }
  }, [id]);

  const fetchPost = async (postId: string) => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`/api/posts/${postId}`);
      setPost(response.data.data);
      fetchComments(postId)
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Post not found');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view this post');
      } else {
        setError('Failed to load post');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !post || !isAuthenticated) return;

    try {
      await axios.post('/api/comments', {
        postId: post._id,
        content: comment,
      });
      setComment('');
      fetchComments(post._id); // Refresh comments
    } catch (err) {
      console.error('Failed to post comment');
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

  // Delete comment function
  const deleteComment = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    
    try {
      await axios.delete(`/api/comments/${commentId}`);
      fetchComments(post!._id); // Refresh comments
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Container>
          <Row className="justify-content-center">
            <Col md={6}>
              <Alert variant="danger">
                <Alert.Heading>{error || 'Post not found'}</Alert.Heading>
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
    <div className="py-5">
      <Container>
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {post.title}
            </li>
          </ol>
        </nav>

        <Row className="g-5">
          {/* Main Content */}
          <Col lg={8}>
            <article>
              {/* Post Header */}
              <header className="mb-5">
                <h1 className="display-4 fw-bold mb-3">{post.title}</h1>
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="text-muted">
                    By {post.author.name} • {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                  <div className="badge bg-primary">{post.views} views</div>
                  <div className="badge bg-secondary">{post.status}</div>
                  <div className="badge bg-info">{post.visibility}</div>
                </div>
              </header>

              {/* Cover Image/Video */}
              {post.media.length > 0 && (
                <div className="mb-5">
                  {post.media[0].type === 'image' ? (
                    <img
                      src={`http://localhost:5000${post.media[0].path}`}
                      alt="Cover"
                      className="img-fluid rounded shadow-sm"
                      style={{ maxHeight: '500px', objectFit: 'cover' }}
                    />
                  ) : (
                    <video
                      src={`http://localhost:5000${post.media[0].path}`}
                      controls
                      className="img-fluid rounded shadow-sm"
                      style={{ maxHeight: '500px' }}
                    >
                      Your browser does not support video.
                    </video>
                  )}
                </div>
              )}

              {/* Post Content */}
              <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
                style={{ lineHeight: 1.8 }}
              />

              {/* Additional Media */}
              {post.media.slice(1).map((media, index) => (
                <div key={index} className="mb-4">
                  {media.type === 'image' ? (
                    <img
                      src={`http://localhost:5000${media.path}`}
                      alt={`Media ${index + 1}`}
                      className="img-fluid rounded shadow-sm"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  ) : (
                    <video
                      src={`http://localhost:5000${media.path}`}
                      controls
                      className="img-fluid rounded shadow-sm"
                    >
                      Your browser does not support video.
                    </video>
                  )}
                </div>
              ))}
            </article>

            <div className="mt-5">
              <h3 className="fw-bold mb-4">
                Comments ({comments.length})
              </h3>
              
              {/* Comments List */}
              {comments.map((comment) => (
                <Card key={comment._id} className="mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <strong>{comment.author.name}</strong>
                        <p className="mb-1">{comment.content}</p>
                        <small className="text-muted">
                          {new Date(comment.createdAt).toLocaleString()}
                        </small>
                      </div>
                      
                      {/* DELETE BUTTON - Only for blog author */}
                      {currentUser?._id === post.author._id && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => deleteComment(comment._id)}
                          className="ms-2"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              ))}

              {/* Comment Form */}
              {isAuthenticated ? (
                <Card className="mb-4">
                  <Card.Body>
                    <form onSubmit={handleCommentSubmit}>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                      />
                      <Button type="submit" className="mt-2" variant="primary">
                        Post Comment
                      </Button>
                    </form>
                  </Card.Body>
                </Card>
              ) : (
                <div className="alert alert-info mb-4">
                  <Link to="/login">Log in</Link> to comment on this post.
                </div>
              )}
            </div>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            <Card className="shadow-sm border-0 mb-4">
              <Card.Body>
                <h5 className="fw-bold mb-3">About Author</h5>
                <p className="text-muted small mb-3">
                  {post.author.name}
                </p>
                <Link className="btn btn-outline-primary btn-sm" to={`/profile/${post.author._id}`} style={{ textDecoration: 'none' }}>
                  View Profile
                </Link>
              </Card.Body>
            </Card>

            <Card className="shadow-sm border-0">
              <Card.Body>
                <h5 className="fw-bold mb-3">Quick Actions</h5>
                <div className="d-grid gap-2">
                  {isAuthenticated && (
                    <Button variant="primary" size="sm">
                      Edit Post
                    </Button>
                  )}
                  <Link className="btn btn-outline-secondary btn-sm" to="/" style={{ textDecoration: 'none' }}>
                    Back to Home
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PostDetail;
