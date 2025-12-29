import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { isAuthenticated, token, loading } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [scheduledAt, setScheduledAt] = useState('');
  const [mediaFiles, setMediaFiles] = useState<FileList | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
        navigate('/login');
    }
  }, [isAuthenticated, loading]);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setMediaFiles(files);
    } else {
      setMediaFiles(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setErrorMsg('Title and content are required.');
      setSuccessMsg('');
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

      if (status === 'scheduled' && scheduledAt) {
        const isoDate = new Date(scheduledAt).toISOString();
        formData.append('scheduledAt', isoDate);
      }

      if (mediaFiles && mediaFiles.length > 0) {
        Array.from(mediaFiles).forEach((file) => {
          formData.append('media', file);
        });
      }

      await axios.post('/api/posts', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMsg('Blog post created successfully.');
      setTitle('');
      setContent('');
      setStatus('draft');
      setVisibility('public');
      setScheduledAt('');
      setMediaFiles(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Failed to create blog post.';
      setErrorMsg(message);
      setSuccessMsg('');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-5 bg-light min-vh-100">
      <Container>
        <Row className="mb-4">
          <Col>
            <h2 className="fw-bold">Dashboard</h2>
            <p className="text-muted mb-0">
              Create a new blog post with multimedia content.
            </p>
          </Col>
        </Row>

        <Row>
          <Col md={8}>
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4">
                <h4 className="mb-4">Create New Blog</h4>

                {errorMsg && (
                  <Alert
                    variant="danger"
                    onClose={() => setErrorMsg('')}
                    dismissible
                  >
                    {errorMsg}
                  </Alert>
                )}
                {successMsg && (
                  <Alert
                    variant="success"
                    onClose={() => setSuccessMsg('')}
                    dismissible
                  >
                    {successMsg}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Title */}
                  <div className="mb-3">
                    <Form.Label className="fw-semibold">Title</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter blog title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  {/* Content */}
                  <div className="mb-3">
                    <Form.Label className="fw-semibold">Content</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      placeholder="Write your blog content (HTML or plain text)"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                    />
                  </div>

                  {/* Status & Visibility */}
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Label className="fw-semibold">Status</Form.Label>
                      <Form.Select
                        value={status}
                        onChange={(e) =>
                          setStatus(e.target.value as 'draft' | 'published' | 'scheduled')
                        }
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="scheduled">Scheduled</option>
                      </Form.Select>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="fw-semibold">Visibility</Form.Label>
                      <Form.Select
                        value={visibility}
                        onChange={(e) =>
                          setVisibility(
                            e.target.value as 'public' | 'friends' | 'private'
                          )
                        }
                      >
                        <option value="public">Public</option>
                        <option value="friends">Friends</option>
                        <option value="private">Private</option>
                      </Form.Select>
                    </Col>
                  </Row>

                  {/* Scheduled Date/Time */}
                  {status === 'scheduled' && (
                    <div className="mb-3">
                      <Form.Label className="fw-semibold">
                        Scheduled Date & Time
                      </Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                      />
                      <Form.Text className="text-muted">
                        Blog will be published automatically at this time.
                      </Form.Text>
                    </div>
                  )}

                  {/* Media Upload */}
                  <div className="mb-4">
                    <Form.Label className="fw-semibold">
                      Multimedia (Images/Videos)
                    </Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleMediaChange}
                      ref={fileInputRef}
                    />
                    <Form.Text className="text-muted">
                      You can attach multiple files. Only images and videos are
                      allowed.
                    </Form.Text>
                    {mediaFiles && mediaFiles.length > 0 && (
                      <div className="mt-2 small text-muted">
                        Selected files: {mediaFiles.length}
                      </div>
                    )}
                  </div>

                  <div className="d-flex justify-content-end">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Saving...
                        </>
                      ) : (
                        'Publish Blog'
                      )}
                    </Button>
                  </div>
                </form>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow-sm border-0 mb-3">
              <Card.Body>
                <h5 className="fw-semibold mb-3">Tips</h5>
                <ul className="mb-0">
                  <li>Use clear titles and rich content.</li>
                  <li>Attach images/videos to make posts engaging.</li>
                  <li>Use Friends visibility for private sharing.</li>
                  <li>Scheduled posts should have valid future dates.</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
