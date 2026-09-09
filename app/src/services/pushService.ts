import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { api, ENDPOINTS } from "./api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications(): Promise<void> {
  if (!Device.isDevice) {
    console.log("Push notifications: simulador/emulador não recebe push remoto.");
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    console.log("Push notifications: permissão negada pelo usuário.");
    return;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.warn(
      "Push notifications: falta extra.eas.projectId em app.json — rode `npx eas init` uma vez."
    );
    return;
  }

  try {
    const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
    await api.post(ENDPOINTS.registerPushToken, { token: pushToken.data });
    console.log("Push token registrado no backend.");
  } catch (err) {
    console.warn("Falha ao registrar push token:", err);
  }
}
