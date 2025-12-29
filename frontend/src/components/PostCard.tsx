import React from 'react';
import { Post } from '../types';
import { Link, useNavigate } from 'react-router-dom';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {

  const navigate = useNavigate()

  const handleReadMore = () => {
    navigate(`/posts/${post._id}`);
  };

  const firstMedia = post.media[0];

  return (
    <div className="card h-100 shadow-sm cursor-pointer" onClick={handleReadMore}>
      {firstMedia && (
        <img 
          className='card-img-top'
          src={`http://localhost:5000${firstMedia.path}`} 
          style={{ height: '200px', objectFit: 'cover' }}
          alt="Post cover"
        />
      )}
      <div className="card-body d-flex flex-column">
        <div className="card-title fs-5 fw-bold">{post.title}</div>
        <div className="card-text flex-grow-1">
          {post.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            <Link to={`/profile/${post.author._id}`} className="text-decoration-none">
              {post.author.name}
            </Link>{' '}
            • {new Date(post.createdAt).toLocaleDateString()} • {post.views} views
          </small>
          <button className="btn btn-outline-primary btn-sm">Read More</button>
        </div>
      </div>
      <button className="btn btn-outline-primary btn-sm" onClick={(e) => {
        e.stopPropagation();
        handleReadMore();
      }}>
        Read More
      </button>
    </div>
  );
};

export default PostCard;
