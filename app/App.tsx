import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import RootNavigator, { resetToRoleSelect } from "./src/navigation";
import { loadStoredToken, setUnauthorizedHandler } from "./src/services/api";
import { loadStoredUser } from "./src/services/authStore";

export default function App() {
  useEffect(() => {
    loadStoredToken();
    loadStoredUser();
    setUnauthorizedHandler(resetToRoleSelect);
    return () => setUnauthorizedHandler(null);
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <RootNavigator />
    </>
  );
}
