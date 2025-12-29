import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Modal, Table, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Category {
  _id: string;
  name: string;
  slug: string;
  createdBy: string;
}

interface Tag {
  _id: string;
  name: string;
  slug: string;
  createdBy: string;
}

const CategoriesTags: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string>('');

  // Tags state
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [showDeleteTagModal, setShowDeleteTagModal] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<string>('');

  // Loading & errors
  const [load, setLoad] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated && !loading) {
        navigate('/login');
    }
    loadCategories();
    loadTags();
  }, [isAuthenticated, loading]);

  const loadCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data.data);
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  const loadTags = async () => {
    try {
      const response = await axios.get('/api/tags');
      setTags(response.data.data);
    } catch (err) {
      setError('Failed to load tags');
    }
  };

  // Category CRUD
  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      setLoad(true);
      await axios.post('/api/categories', { name: newCategoryName });
      setNewCategoryName('');
      loadCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setLoad(false);
    }
  };

  const updateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !newCategoryName.trim()) return;

    try {
      setLoad(true);
      await axios.put(`/api/categories/${editingCategory._id}`, { 
        name: newCategoryName 
      });
      setEditingCategory(null);
      setNewCategoryName('');
      loadCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update category');
    } finally {
      setLoad(false);
    }
  };

  const deleteCategory = async () => {
    try {
      await axios.delete(`/api/categories/${categoryToDelete}`);
      setShowDeleteCategoryModal(false);
      loadCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete category');
    }
  };

  // Tag CRUD
  const createTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      setLoad(true);
      await axios.post('/api/tags', { name: newTagName });
      setNewTagName('');
      loadTags();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create tag');
    } finally {
      setLoad(false);
    }
  };

  const updateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag || !newTagName.trim()) return;

    try {
      setLoad(true);
      await axios.put(`/api/tags/${editingTag._id}`, { name: newTagName });
      setEditingTag(null);
      setNewTagName('');
      loadTags();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update tag');
    } finally {
      setLoad(false);
    }
  };

  const deleteTag = async () => {
    try {
      await axios.delete(`/api/tags/${tagToDelete}`);
      setShowDeleteTagModal(false);
      loadTags();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete tag');
    }
  };

  return (
    <div className="py-5 bg-light min-vh-100">
      <Container>
        <Row className="mb-4">
          <Col>
            <h2 className="fw-bold">Categories & Tags</h2>
            <p className="text-muted">
              Manage categories and tags for better post organization (Story 2)
            </p>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible className="mb-4">
            {error}
          </Alert>
        )}

        <Row>
          {/* Categories Section */}
          <Col md={6}>
            <Card className="shadow-sm border-0 mb-4">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0 fw-bold">Categories ({categories.length})</h5>
              </Card.Header>
              <Card.Body>
                <form onSubmit={editingCategory ? updateCategory : createCategory}>
                  <div className="input-group mb-3">
                    <Form.Control
                      type="text"
                      placeholder="New category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      disabled={load}
                    />
                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={load || !newCategoryName.trim()}
                    >
                      {editingCategory ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>

                {categories.length === 0 ? (
                  <p className="text-muted text-center">No categories yet</p>
                ) : (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category._id}>
                          <td>
                            {editingCategory?._id === category._id ? (
                              <Form.Control
                                size="sm"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                              />
                            ) : (
                              <strong>{category.name}</strong>
                            )}
                          </td>
                          <td>
                            <Badge bg="secondary">{category.slug}</Badge>
                          </td>
                          <td>
                            {editingCategory?._id === category._id ? (
                              <Button 
                                size="sm" 
                                variant="success" 
                                onClick={updateCategory as any}
                                className="me-1"
                              >
                                ✓ Save
                              </Button>
                            ) : (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="warning" 
                                  onClick={() => {
                                    setEditingCategory(category);
                                    setNewCategoryName(category.name);
                                  }}
                                  className="me-1"
                                >
                                  Edit
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="danger" 
                                  onClick={() => {
                                    setCategoryToDelete(category._id);
                                    setShowDeleteCategoryModal(true);
                                  }}
                                >
                                  Delete
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Tags Section */}
          <Col md={6}>
            <Card className="shadow-sm border-0 mb-4">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0 fw-bold">Tags ({tags.length})</h5>
              </Card.Header>
              <Card.Body>
                <form onSubmit={editingTag ? updateTag : createTag}>
                  <div className="input-group mb-3">
                    <Form.Control
                      type="text"
                      placeholder="New tag name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      disabled={load}
                    />
                    <Button 
                      type="submit" 
                      variant="success" 
                      disabled={load || !newTagName.trim()}
                    >
                      {editingTag ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>

                {tags.length === 0 ? (
                  <p className="text-muted text-center">No tags yet</p>
                ) : (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tags.map((tag) => (
                        <tr key={tag._id}>
                          <td>
                            {editingTag?._id === tag._id ? (
                              <Form.Control
                                size="sm"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                              />
                            ) : (
                              <strong>{tag.name}</strong>
                            )}
                          </td>
                          <td>
                            <Badge bg="secondary">{tag.slug}</Badge>
                          </td>
                          <td>
                            {editingTag?._id === tag._id ? (
                              <Button 
                                size="sm" 
                                variant="success" 
                                onClick={updateTag as any}
                                className="me-1"
                              >
                                ✓ Save
                              </Button>
                            ) : (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="warning" 
                                  onClick={() => {
                                    setEditingTag(tag);
                                    setNewTagName(tag.name);
                                  }}
                                  className="me-1"
                                >
                                  Edit
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="danger" 
                                  onClick={() => {
                                    setTagToDelete(tag._id);
                                    setShowDeleteTagModal(true);
                                  }}
                                >
                                  Delete
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Delete Confirmation Modals */}
      <Modal show={showDeleteCategoryModal} onHide={() => setShowDeleteCategoryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this category? 
          <strong className="text-danger">Cannot delete if used in posts</strong> (Story 2).
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteCategoryModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteCategory}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteTagModal} onHide={() => setShowDeleteTagModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Tag</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this tag? 
          <strong className="text-danger">Cannot delete if used in posts</strong> (Story 2).
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteTagModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteTag}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CategoriesTags;
