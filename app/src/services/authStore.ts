import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthUser } from "../types";

const USER_KEY = "@postinder/user";

let currentUser: AuthUser | null = null;

export async function storeUser(user: AuthUser) {
  currentUser = user;
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function loadStoredUser(): Promise<AuthUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  currentUser = raw ? JSON.parse(raw) : null;
  return currentUser;
}

export function getUser(): AuthUser | null {
  return currentUser;
}

export async function clearUser() {
  currentUser = null;
  await AsyncStorage.removeItem(USER_KEY);
}
