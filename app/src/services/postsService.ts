import { api, ENDPOINTS } from "./api";
import { Post } from "../types";

interface ClientPortalResponse {
  client: { id: string; name: string; portalSettings?: unknown };
  posts: Post[];
  feedbacks: unknown[];
}

export async function fetchClientPortal(): Promise<ClientPortalResponse> {
  const { data } = await api.get<ClientPortalResponse>(ENDPOINTS.clientPortal);
  return data;
}

export async function approvePost(
  post: Post,
  positiveReaction?: "loved"
) {
  const { data } = await api.post(ENDPOINTS.clientPortalApprove(post.id), {
    expectedRevision: post.contentRevision,
    ...(positiveReaction ? { positiveReaction } : {}),
  });
  return data;
}

export async function rejectPost(post: Post, comment: string, tags?: string[]) {
  const { data } = await api.post(ENDPOINTS.clientPortalReject(post.id), {
    expectedRevision: post.contentRevision,
    comment,
    tags,
  });
  return data;
}

export async function fetchPublicPortal(token: string): Promise<ClientPortalResponse> {
  const { data } = await api.get<ClientPortalResponse>(ENDPOINTS.publicPortal(token));
  return data;
}

export async function approvePublicPost(
  token: string,
  post: Post,
  positiveReaction?: "loved"
) {
  const { data } = await api.post(ENDPOINTS.publicPortalApprove(token, post.id), {
    expectedRevision: post.contentRevision,
    ...(positiveReaction ? { positiveReaction } : {}),
  });
  return data;
}

export async function rejectPublicPost(
  token: string,
  post: Post,
  comment: string,
  tags?: string[]
) {
  const { data } = await api.post(ENDPOINTS.publicPortalReject(token, post.id), {
    expectedRevision: post.contentRevision,
    comment,
    tags,
  });
  return data;
}

export async function fetchAdminApprovalsQueue(): Promise<Post[]> {
  const { data } = await api.get<Post[]>(ENDPOINTS.adminApprovalsQueue);
  return data;
}

export async function fetchAdminPostsByStatus(status: string): Promise<Post[]> {
  const { data } = await api.get<Post[]>(ENDPOINTS.adminPostsByStatus(status));
  return data;
}

export interface NewPostFile {
  uri: string;
  name: string;
  mimeType: string;
}

export async function createAdminPost(input: {
  clientId: string;
  title: string;
  description?: string;
  channels: string[];
  files: NewPostFile[];
}): Promise<Post> {
  const form = new FormData();
  form.append("clientId", input.clientId);
  form.append("title", input.title);
  if (input.description) form.append("description", input.description);
  form.append("channels", JSON.stringify(input.channels));
  input.files.forEach((file) => {
    form.append("files", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType,
    } as unknown as Blob);
  });

  const { data } = await api.post<Post>(ENDPOINTS.adminPosts, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function fetchAdminPost(postId: string): Promise<Post> {
  const { data } = await api.get<Post>(ENDPOINTS.adminPost(postId));
  return data;
}

export async function updateAdminPost(
  postId: string,
  input: {
    title: string;
    description?: string;
    channels: string[];
    newFiles: NewPostFile[];
    status?: string;
  }
): Promise<Post> {
  const form = new FormData();
  form.append("title", input.title);
  if (input.description) form.append("description", input.description);
  form.append("channels", JSON.stringify(input.channels));
  if (input.status) form.append("status", input.status);
  input.newFiles.forEach((file) => {
    form.append("files", { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob);
  });

  const { data } = await api.patch<Post>(ENDPOINTS.adminPost(postId), form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
