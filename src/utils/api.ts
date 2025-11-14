// src/utils/api.ts
import type { 
  User, 
  Post, 
  Comment, 
  Story, 
  Message, 
  Conversation, 
  Notification,
  Reel,
  PaginatedResponse,
  SearchResult,
  MediaItem
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiError {
  error: string;
  details?: any;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const error: ApiError = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    } else {
      const text = await response.text().catch(() => '');
      const snippet = text ? text.substring(0, 200) : '';
      throw new Error(`API error ${response.status} ${response.statusText}${snippet ? ` — ${snippet}` : ''}`);
    }
  }
  return response.json();
}

// Helper to make authenticated requests
async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const isForm = options.body instanceof FormData;
  const headers: HeadersInit = isForm
    ? { ...(options.headers || {}) }
    : { 'Content-Type': 'application/json', ...(options.headers || {}) };

  // Get Clerk session token for authentication
  let authToken: string | null = null;
  try {
    if ((window as any).Clerk) {
      const clerk = (window as any).Clerk;
      if (clerk.session) {
        authToken = await clerk.session.getToken();
      }
    }
  } catch (err) {
    console.warn('Could not get Clerk token:', err);
  }

  if (authToken) {
    (headers as any).Authorization = `Bearer ${authToken}`;
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}

// File upload helper
export async function uploadFile(file: File): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({ url: String(reader.result) });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// Media API (upload without creating a Story)
export const mediaApi = {
  async upload(file: File): Promise<{ url: string; type: 'image' | 'video'; filename: string; size: number }> {
    const form = new FormData();
    form.append('file', file);
    const response = await authenticatedFetch(`${API_URL}/media`, {
      method: 'POST',
      body: form,
    });
    return handleResponse(response);
  },
};

// Posts API
export const postsApi = {
  async getFeed(page = 1, limit = 20): Promise<PaginatedResponse<Post>> {
    const response = await authenticatedFetch(`${API_URL}/posts?page=${page}&limit=${limit}`);
    const data = await handleResponse<{ posts: Post[]; pagination: any }>(response);
    return {
      items: data.posts || [],
      pagination: data.pagination || { page, limit, total: 0, hasMore: false }
    };
  },

  async getUserPosts(clerkId: string, page = 1, limit = 20): Promise<PaginatedResponse<Post>> {
    const response = await authenticatedFetch(`${API_URL}/profiles/${clerkId}/posts?page=${page}&limit=${limit}`);
    const data = await handleResponse<{ posts: Post[]; pagination: any }>(response);
    return {
      items: data.posts || [],
      pagination: data.pagination || { page, limit, total: 0, hasMore: false }
    };
  },

  async getPost(postId: string): Promise<Post> {
    const response = await authenticatedFetch(`${API_URL}/posts/${encodeURIComponent(postId)}`);
    return handleResponse<Post>(response);
  },

  async createPost(data: { text?: string; media?: MediaItem[] }): Promise<Post> {
    const response = await authenticatedFetch(`${API_URL}/posts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse<Post>(response);
  },

  async createPostWithMedia(text: string, files: File[]): Promise<Post> {
    const mediaPromises = files.map(async (file) => {
      const { url } = await uploadFile(file);
      const type = file.type.startsWith('image') ? 'image' : 'video';
      return { url, type } as MediaItem;
    });
    const media = await Promise.all(mediaPromises);
    return postsApi.createPost({ text, media });
  },

  async updatePost(postId: string, data: { text?: string; media?: MediaItem[] }): Promise<Post> {
    const response = await authenticatedFetch(`${API_URL}/posts/${encodeURIComponent(postId)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return handleResponse<Post>(response);
  },

  async deletePost(postId: string): Promise<void> {
    const response = await authenticatedFetch(`${API_URL}/posts/${encodeURIComponent(postId)}`, {
      method: 'DELETE',
    });
    await handleResponse<void>(response);
  },

  async repost(postId: string): Promise<Post> {
    const response = await authenticatedFetch(`${API_URL}/posts/${encodeURIComponent(postId)}/repost`, {
      method: 'POST'
    });
    return handleResponse<Post>(response);
  },
};

// Stories API
export const storiesApi = {
  async getStories(): Promise<Story[]> {
    const response = await authenticatedFetch(`${API_URL}/stories`);
    const data = await handleResponse<{ stories: Story[] }>(response);
    return data.stories || [];
  },

  async createStory(file: File, text?: string): Promise<Story> {
    const form = new FormData();
    form.append('file', file);
    if (text) form.append('text', text);

    const response = await authenticatedFetch(`${API_URL}/stories`, {
      method: 'POST',
      body: form,
    });
    const data = await handleResponse<{ story: Story }>(response);
    return (data as any).story || (data as any);
  },

  async viewStory(storyId: string): Promise<void> {
    const response = await authenticatedFetch(`${API_URL}/stories/${encodeURIComponent(storyId)}/view`, {
      method: 'POST',
    });
    await handleResponse<void>(response);
  },

  async deleteStory(id: string): Promise<void> {
    const response = await authenticatedFetch(`${API_URL}/stories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    await handleResponse<void>(response);
  },
};

// Profiles API
export const profilesApi = {
  async getMyProfile(): Promise<User> {
    const response = await authenticatedFetch(`${API_URL}/profiles/me`);
    return handleResponse<User>(response);
  },

  async getProfile(clerkId: string): Promise<User> {
    const response = await authenticatedFetch(`${API_URL}/profiles/${clerkId}`);
    return handleResponse<User>(response);
  },

  async updateProfile(data: { 
    username?: string; 
    name?: string; 
    bio?: string; 
    avatarUrl?: string; 
    links?: string[];
    isPrivate?: boolean;
  }): Promise<User> {
    const response = await authenticatedFetch(`${API_URL}/profiles/me`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return handleResponse<User>(response);
  },

  async getSuggestions(limit = 10): Promise<User[]> {
    const response = await authenticatedFetch(`${API_URL}/search/users?limit=${limit}`);
    const data = await handleResponse<{ users: User[] }>(response);
    return data.users || [];
  },
};

// Messages API
export const messagesApi = {
  async getConversations(): Promise<Conversation[]> {
    const response = await authenticatedFetch(`${API_URL}/messages/conversations`);
    return handleResponse<Conversation[]>(response);
  },

  async getMessages(userId: string): Promise<Message[]> {
    const response = await authenticatedFetch(`${API_URL}/messages/${userId}`);
    return handleResponse<Message[]>(response);
  },

  async sendMessage(data: { toId: string; text?: string; mediaUrl?: string }): Promise<Message> {
    const response = await authenticatedFetch(`${API_URL}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse<Message>(response);
  },

  async markAsRead(messageId: string): Promise<void> {
    const response = await authenticatedFetch(`${API_URL}/messages/${messageId}/read`, {
      method: 'PATCH',
    });
    await handleResponse<void>(response);
  },

  async deleteMessage(id: string): Promise<void> {
    const response = await authenticatedFetch(`${API_URL}/messages/${id}`, {
      method: 'DELETE',
    });
    await handleResponse<void>(response);
  },
};

// Reactions API
export const reactionsApi = {
  async toggleReaction(postId: string, type: '😂' | '😡' | '❤️' | '😊'): Promise<{ isLiked: boolean; likeCount: number; type?: string }> {
    // map emoji to server reaction types
    const map: Record<string, string> = { '😂': 'laugh', '😡': 'angry', '❤️': 'love', '😊': 'smile' };
    const response = await authenticatedFetch(`${API_URL}/reactions/toggle`, {
      method: 'POST',
      body: JSON.stringify({ postId, type: map[type] }),
    });
    return handleResponse(response);
  },

  async checkLike(postId: string): Promise<{ isLiked: boolean; type?: string }> {
    const response = await authenticatedFetch(`${API_URL}/reactions/check?postId=${postId}`);
    return handleResponse(response);
  },
};

// Comments API
export const commentsApi = {
  async getComments(postId: string): Promise<Comment[]> {
    const response = await authenticatedFetch(`${API_URL}/comments?postId=${postId}`);
    return handleResponse<Comment[]>(response);
  },

  async createComment(data: { postId: string; text: string; parentId?: string }): Promise<Comment> {
    const response = await authenticatedFetch(`${API_URL}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse<Comment>(response);
  },

  async deleteComment(id: string): Promise<void> {
    const response = await authenticatedFetch(`${API_URL}/comments/${id}`, {
      method: 'DELETE',
    });
    await handleResponse<void>(response);
  },

  async toggleCommentLike(commentId: string): Promise<{ isLiked: boolean; likeCount: number }> {
    const response = await authenticatedFetch(`${API_URL}/comments/${commentId}/like`, {
      method: 'POST',
    });
    return handleResponse<{ isLiked: boolean; likeCount: number }>(response);
  },
};

// Follows API
export const followsApi = {
  async toggleFollow(followeeId: string): Promise<{ isFollowing: boolean }> {
    const response = await authenticatedFetch(`${API_URL}/follows`, {
      method: 'POST',
      body: JSON.stringify({ followeeId }),
    });

    if (response.status === 201) {
      await handleResponse<any>(response);
      return { isFollowing: true };
    }

    if (response.status === 409) {
      const del = await authenticatedFetch(`${API_URL}/follows/${encodeURIComponent(followeeId)}`, {
        method: 'DELETE',
      });
      await handleResponse<any>(del);
      return { isFollowing: false };
    }

    await handleResponse<any>(response);
    return { isFollowing: true };
  },

  async getFollowers(clerkId: string): Promise<User[]> {
    const response = await authenticatedFetch(`${API_URL}/follows/followers/${encodeURIComponent(clerkId)}`);
    const data = await handleResponse<{ followers: User[] }>(response);
    return data.followers || [];
  },

  async getFollowing(clerkId: string): Promise<User[]> {
    const response = await authenticatedFetch(`${API_URL}/follows/following/${encodeURIComponent(clerkId)}`);
    const data = await handleResponse<{ following: User[] }>(response);
    return data.following || [];
  },
};

// Notifications API
export const notificationsApi = {
  async getNotifications(): Promise<Notification[]> {
    const response = await authenticatedFetch(`${API_URL}/notifications`);
    return handleResponse<Notification[]>(response);
  },

  async markAsRead(notificationId: string): Promise<void> {
    const response = await authenticatedFetch(`${API_URL}/notifications/${encodeURIComponent(notificationId)}/read`, {
      method: 'PATCH',
    });
    await handleResponse<void>(response);
  },

  async markAllAsRead(): Promise<void> {
    const response = await authenticatedFetch(`${API_URL}/notifications/read-all`, {
      method: 'PATCH',
    });
    await handleResponse<void>(response);
  },
};

// Search API
export const searchApi = {
  async search(query: string, type: 'users' | 'posts' | 'all' = 'all'): Promise<SearchResult> {
    const response = await authenticatedFetch(`${API_URL}/search?q=${encodeURIComponent(query)}&type=${type}`);
    return handleResponse<SearchResult>(response);
  },

  async searchUsers(query: string): Promise<User[]> {
    const response = await authenticatedFetch(`${API_URL}/search?q=${encodeURIComponent(query)}&type=users`);
    const data = await handleResponse<{ users: User[] }>(response);
    return data.users || [];
  },

  async searchHashtags(query: string): Promise<string[]> {
    const response = await authenticatedFetch(`${API_URL}/search/hashtags?q=${encodeURIComponent(query)}`);
    const data = await handleResponse<{ hashtags: string[] }>(response);
    return data.hashtags || [];
  },
};

// Reels API (if backend supports it)
export const reelsApi = {
  async getReels(page = 1, limit = 10): Promise<PaginatedResponse<Reel>> {
    const response = await authenticatedFetch(`${API_URL}/reels?page=${page}&limit=${limit}`);
    const data = await handleResponse<{ reels: Reel[]; pagination: any }>(response);
    return {
      items: data.reels || [],
      pagination: data.pagination || { page, limit, total: 0, hasMore: false }
    };
  },

  async createReel(file: File, text?: string, audio?: string): Promise<Reel> {
    const form = new FormData();
    form.append('file', file);
    if (text) form.append('text', text);
    if (audio) form.append('audio', audio);

    const response = await authenticatedFetch(`${API_URL}/reels`, {
      method: 'POST',
      body: form,
    });
    return handleResponse<Reel>(response);
  },

  async deleteReel(id: string): Promise<void> {
    const response = await authenticatedFetch(`${API_URL}/reels/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    await handleResponse<void>(response);
  },
};