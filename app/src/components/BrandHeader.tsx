import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

export default function BrandHeader({ subtitle }: { subtitle: string }) {
  return (
    <View style={styles.container}>
      <Ionicons name="flame" size={36} color={colors.primary} style={styles.icon} />
      <Text style={styles.title}>
        Post<Text style={{ color: colors.primary }}>inder</Text>
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginBottom: 28 },
  icon: { marginBottom: 8 },
  title: { fontSize: 30, fontWeight: "800", color: colors.text, letterSpacing: -0.5 },
  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
