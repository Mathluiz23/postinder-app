import { api, ENDPOINTS } from "./api";
import { ClientOverview, Metrics } from "../types";

export async function fetchAdminClients(): Promise<ClientOverview[]> {
  const { data } = await api.get<ClientOverview[]>(ENDPOINTS.adminClients);
  return data;
}

export async function fetchClient(clientId: string): Promise<ClientOverview> {
  const { data } = await api.get<ClientOverview>(ENDPOINTS.adminClient(clientId));
  return data;
}

export async function createClient(input: {
  name: string;
  email: string;
  password: string;
  brandColor?: string;
}): Promise<ClientOverview> {
  const { data } = await api.post<ClientOverview>(ENDPOINTS.adminClients, input);
  return data;
}

export async function updateClient(
  clientId: string,
  input: Partial<{ name: string; email: string; password: string; brandColor: string; active: boolean }>
): Promise<ClientOverview> {
  const { data } = await api.patch<ClientOverview>(ENDPOINTS.adminClient(clientId), input);
  return data;
}

export async function deleteClient(clientId: string): Promise<void> {
  await api.delete(ENDPOINTS.adminClient(clientId));
}

export async function fetchMetrics(): Promise<Metrics> {
  const { data } = await api.get<Metrics>(ENDPOINTS.adminMetrics);
  return data;
}
