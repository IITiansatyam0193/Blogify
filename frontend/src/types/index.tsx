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
  themeId?: Theme;
}

export interface Theme {
  _id: string;
  name: string;
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
    activeTheme?: Theme;
  };
}

export interface FriendRequest {
  from: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Friend {
  _id: string;
  name: string;
  email: string;
}

export interface Profile {
  _id: string;
  name: string;
  email?: string;
  friends?: Friend[];
  incomingRequests?: FriendRequest[];
  outgoingRequests?: FriendRequest[];
}
