export type UserType = "admin" | "client";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  permissions?: string[];
  type: UserType;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export enum PostStatus {
  DRAFT = "draft",
  READY = "ready",
  SENT = "sent",
  PENDING_APPROVAL = "pending_approval",
  APPROVED = "approved",
  REJECTED = "rejected",
  EXECUTED = "executed",
  SCHEDULED = "scheduled",
  PUBLISHED = "published",
}

export type FileType =
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "document"
  | "spreadsheet"
  | "presentation";

export interface PostFile {
  id: string;
  name: string;
  url: string | null;
  storage_url: string | null;
  file_type: FileType;
  mime_type: string;
}

export type PositiveReaction = "loved" | null;

export interface Post {
  id: string;
  clientId: string;
  clientName?: string;
  companyId?: string;
  title: string;
  description?: string;
  status: PostStatus;
  channels: string[];
  formats: Record<string, string[]>;
  scheduledDate: string | null;
  createdAt: string;
  updatedAt: string;
  contentRevision: number;
  approvedRevision: number | null;
  positiveReaction: PositiveReaction;
  emailLink: string | null;
  files: PostFile[];
  feedback?: { id: string; comment: string; tags: string[] | null; createdAt: string }[];
}

export interface ClientOverview {
  id: string;
  name: string;
  email?: string;
  active: boolean;
  brandColor?: string;
}

export interface Metrics {
  totalsByStatus: Record<string, number>;
  totalPosts: number;
  byClient: {
    clientId: string;
    clientName: string;
    totalsByStatus: Record<string, number>;
  }[];
}
