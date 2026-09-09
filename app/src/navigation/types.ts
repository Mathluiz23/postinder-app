export type RootStackParamList = {
  RoleSelect: undefined;
  ClientFlow: undefined;
  AdminFlow: undefined;
  PublicPortal: { token: string };
};

export type ClientStackParamList = {
  Login: undefined;
  ApprovalQueue: undefined;
  History: undefined;
};

export type AdminStackParamList = {
  AdminLogin: undefined;
  AdminDashboard: undefined;
  AdminQueue: undefined;
  AdminCreatePost: { postId?: string };
  AdminClientForm: { clientId?: string };
  AdminPostsByStatus: { status: string; label: string };
};
