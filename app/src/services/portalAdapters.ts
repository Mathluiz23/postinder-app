import { Post } from "../types";
import {
  fetchClientPortal,
  approvePost,
  rejectPost,
  fetchPublicPortal,
  approvePublicPost,
  rejectPublicPost,
} from "./postsService";

export interface PortalData {
  client: { id: string; name: string; portalSettings?: unknown };
  posts: Post[];
  feedbacks: unknown[];
}

export interface PortalAdapter {
  fetchPortal(): Promise<PortalData>;
  approve(post: Post, positiveReaction?: "loved"): Promise<unknown>;
  reject(post: Post, comment: string, tags?: string[]): Promise<unknown>;
}

export function createAuthenticatedPortalAdapter(): PortalAdapter {
  return {
    fetchPortal: fetchClientPortal,
    approve: (post, positiveReaction) => approvePost(post, positiveReaction),
    reject: (post, comment, tags) => rejectPost(post, comment, tags),
  };
}

export function createPublicPortalAdapter(token: string): PortalAdapter {
  return {
    fetchPortal: () => fetchPublicPortal(token),
    approve: (post, positiveReaction) => approvePublicPost(token, post, positiveReaction),
    reject: (post, comment, tags) => rejectPublicPost(token, post, comment, tags),
  };
}
