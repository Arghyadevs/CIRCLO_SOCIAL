// src/types/index.ts
// Core type definitions for Circlo Social

export interface User {
  _id: string;
  clerkId: string;
  username?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  links?: string[];
  isVerified: boolean;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: UserStats;
}

export interface UserStats {
  postCount: number;
  followerCount: number;
  followingCount: number;
}

export interface Post {
  _id: string;
  authorId: string;
  text: string;
  media: MediaItem[];
  likeCount: number;
  commentCount: number;
  shareCount?: number;
  sharedFrom?: string;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
  location?: string;
  isSaved?: boolean;
}

export type MediaItem = {
  url: string;
  type: 'image' | 'video';
  thumbnail?: string;
  width?: number;
  height?: number;
};

export interface Comment {
  _id: string;
  postId: string;
  authorId: string;
  text: string;
  parentId?: string;
  likeCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
}

export interface Story {
  _id: string;
  authorId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  text?: string;
  viewCount: number;
  createdAt: string;
  expiresAt: string;
  isViewed?: boolean;
}

export interface Message {
  _id: string;
  fromId: string;
  toId: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  userId: string;
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

export interface Notification {
  _id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'story_view';
  actorId: string;
  actor?: User;
  postId?: string;
  commentId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Reel {
  _id: string;
  authorId: string;
  videoUrl: string;
  thumbnail?: string;
  text?: string;
  audio?: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  createdAt: string;
  isLiked?: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface SearchResult {
  users: User[];
  posts: Post[];
  hashtags: string[];
}