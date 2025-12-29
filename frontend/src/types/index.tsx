export interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'draft' | 'published' | 'scheduled';
  visibility: 'public' | 'friends' | 'private';
  views: number;
  media: Array<{
    filename: string;
    path: string;
    type: 'image' | 'video';
    size: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface FriendRequest {
  from: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Profile {
  _id: string;
  name: string;
  email?: string;
  friends?: string[];
  incomingRequests?: FriendRequest[];
  outgoingRequests?: FriendRequest[];
}
