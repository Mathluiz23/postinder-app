import React from "react";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import { RootStackParamList, ClientStackParamList, AdminStackParamList } from "./types";

import RoleSelectScreen from "../screens/RoleSelectScreen";
import LoginScreen from "../screens/client/LoginScreen";
import ApprovalQueueScreen from "../screens/client/ApprovalQueueScreen";
import HistoryScreen from "../screens/client/HistoryScreen";
import AdminLoginScreen from "../screens/admin/AdminLoginScreen";
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import AdminQueueScreen from "../screens/admin/AdminQueueScreen";
import AdminCreatePostScreen from "../screens/admin/AdminCreatePostScreen";
import AdminClientFormScreen from "../screens/admin/AdminClientFormScreen";
import AdminPostsByStatusScreen from "../screens/admin/AdminPostsByStatusScreen";
import PublicPortalScreen from "../screens/public/PublicPortalScreen";
import LogoutButton from "../components/LogoutButton";
import { colors } from "../theme/colors";

const headerScreenOptions = {
  headerShown: true,
  headerStyle: { backgroundColor: colors.bgCard },
  headerTintColor: colors.primaryDark,
  headerTitleStyle: { color: colors.text },
};

const linking = {
  prefixes: [Linking.createURL("/"), "postinder://"],
  config: {
    screens: {
      PublicPortal: "portal/:token",
      RoleSelect: "*",
    },
  },
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const ClientStack = createNativeStackNavigator<ClientStackParamList>();
const AdminStack = createNativeStackNavigator<AdminStackParamList>();

function ClientNavigator() {
  return (
    <ClientStack.Navigator screenOptions={headerScreenOptions}>
      <ClientStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <ClientStack.Screen
        name="ApprovalQueue"
        component={ApprovalQueueScreen}
        options={{
          title: "Fila de aprovação",
          headerRight: () => <LogoutButton onLoggedOut={resetToRoleSelect} />,
        }}
      />
      <ClientStack.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: "Histórico",
          headerRight: () => <LogoutButton onLoggedOut={resetToRoleSelect} />,
        }}
      />
    </ClientStack.Navigator>
  );
}

function AdminNavigator() {
  return (
    <AdminStack.Navigator screenOptions={headerScreenOptions}>
      <AdminStack.Screen
        name="AdminLogin"
        component={AdminLoginScreen}
        options={{ headerShown: false }}
      />
      <AdminStack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          title: "Clientes",
          headerRight: () => <LogoutButton onLoggedOut={resetToRoleSelect} />,
        }}
      />
      <AdminStack.Screen
        name="AdminQueue"
        component={AdminQueueScreen}
        options={{
          title: "Fila consolidada",
          headerRight: () => <LogoutButton onLoggedOut={resetToRoleSelect} />,
        }}
      />
      <AdminStack.Screen
        name="AdminCreatePost"
        component={AdminCreatePostScreen}
        options={({ route }) => ({
          title: route.params?.postId ? "Editar post" : "Novo post",
        })}
      />
      <AdminStack.Screen
        name="AdminClientForm"
        component={AdminClientFormScreen}
        options={({ route }) => ({
          title: route.params?.clientId ? "Editar cliente" : "Novo cliente",
        })}
      />
      <AdminStack.Screen
        name="AdminPostsByStatus"
        component={AdminPostsByStatusScreen}
        options={({ route }) => ({ title: route.params.label })}
      />
    </AdminStack.Navigator>
  );
}

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function resetToRoleSelect() {
  if (navigationRef.isReady()) {
    navigationRef.reset({ index: 0, routes: [{ name: "RoleSelect" }] });
  }
}

export default function RootNavigator() {
  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="RoleSelect" component={RoleSelectScreen} />
        <RootStack.Screen name="ClientFlow" component={ClientNavigator} />
        <RootStack.Screen name="AdminFlow" component={AdminNavigator} />
        <RootStack.Screen
          name="PublicPortal"
          component={PublicPortalScreen}
          options={{ ...headerScreenOptions, title: "Portal de aprovação" }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
