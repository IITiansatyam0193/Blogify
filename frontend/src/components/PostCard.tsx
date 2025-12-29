import React from 'react';
import { Post } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Avatar,
  Divider
} from '@mui/material';
import { Visibility as ViewIcon } from '@mui/icons-material';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const navigate = useNavigate();

  const handleReadMore = () => {
    navigate(`/posts/${post._id}`);
  };

  const firstMedia = post.media[0];

  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 8,
          cursor: 'pointer'
        }
      }}
      onClick={handleReadMore}
    >
      <CardMedia
        component="img"
        height="200"
        image={firstMedia ? `http://localhost:5000${firstMedia.path}` : 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1000&auto=format&fit=crop'}
        alt={post.title}
        sx={{ bgcolor: 'grey.100' }}
      />
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography gutterBottom variant="h6" component="h2" fontWeight={700} sx={{ lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}>
          {post.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden', mb: 2 }}>
          {post.content.replace(/<[^>]*>/g, '')}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
            {post.author.name.charAt(0)}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              noWrap
              component={Link}
              to={`/profile/${post.author._id}`}
              onClick={(e) => e.stopPropagation()}
              sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { color: 'primary.main' } }}
            >
              {post.author.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {new Date(post.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
          <ViewIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
          <Typography variant="caption">{post.views} views</Typography>
        </Box>
        <Button size="small" variant="text" sx={{ fontWeight: 600 }}>
          Read More
        </Button>
      </CardActions>
    </Card>
  );
};

export default PostCard;
