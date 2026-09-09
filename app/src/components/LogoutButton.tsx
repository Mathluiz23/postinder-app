import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { logout } from "../services/authService";

interface Props {
  onLoggedOut: () => void;
}

export default function LogoutButton({ onLoggedOut }: Props) {
  async function handleLogout() {
    await logout();
    onLoggedOut();
  }

  return (
    <TouchableOpacity onPress={handleLogout} hitSlop={12}>
      <Text style={styles.text}>Sair</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  text: { color: "#eb5757", fontWeight: "600" },
});
