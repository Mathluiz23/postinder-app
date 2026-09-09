import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import BrandHeader from "../components/BrandHeader";

type Props = NativeStackScreenProps<RootStackParamList, "RoleSelect">;

export default function RoleSelectScreen({ navigation }: Props) {
  const [token, setToken] = useState("");

  function openPublicPortal() {
    const trimmed = token.trim();
    if (!trimmed) return;
    navigation.navigate("PublicPortal", { token: trimmed });
  }

  return (
    <View style={styles.container}>
      <BrandHeader subtitle="Plataforma de aprovação de conteúdo" />

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("ClientFlow")}
      >
        <View style={[styles.iconBadge, { backgroundColor: colors.primaryTint }]}>
          <Ionicons name="person" size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Sou cliente</Text>
          <Text style={styles.cardSubtitle}>Aprovar conteúdo da minha agência</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("AdminFlow")}
      >
        <View style={[styles.iconBadge, { backgroundColor: colors.secondaryTint }]}>
          <Ionicons name="briefcase" size={20} color={colors.secondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Sou da agência</Text>
          <Text style={styles.cardSubtitle}>Acompanhar aprovações dos clientes</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <View style={styles.tokenBox}>
        <Text style={styles.tokenLabel}>Já tem um link/token de aprovação?</Text>
        <TextInput
          style={styles.tokenInput}
          placeholder="Cole aqui o token recebido"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          value={token}
          onChangeText={setToken}
        />
        <TouchableOpacity
          style={[styles.tokenButton, !token.trim() && styles.tokenButtonDisabled]}
          onPress={openPublicPortal}
          disabled={!token.trim()}
        >
          <Text style={styles.tokenButtonText}>Abrir portal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", backgroundColor: colors.bgPage },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 17, fontWeight: "700", color: colors.text },
  cardSubtitle: { color: colors.textMuted, marginTop: 2, fontSize: 13 },
  tokenBox: { marginTop: 20 },
  tokenLabel: { fontSize: 13, color: colors.textMuted, marginBottom: 8, textAlign: "center" },
  tokenInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: colors.bgCard,
    color: colors.text,
  },
  tokenButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    backgroundColor: colors.secondary,
  },
  tokenButtonDisabled: { opacity: 0.4 },
  tokenButtonText: { color: "#fff", fontWeight: "600" },
});
