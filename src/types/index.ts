export interface Comment {
  userName: string;
  content: string;
  createdAt: Date;
  replies: Comment[];
}

export interface PostData {
  savedByUser: unknown;
  id: string;
  userId: string;
  userName: string;
  imageUrl: string;
  likeCount: number;
  likedByUser: boolean;
  createdAt: Date;
  comments: Comment[];
  savedBy?: string[];
}
