import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AdminStackParamList } from "../../navigation/types";
import { fetchClient, createClient, updateClient, deleteClient } from "../../services/clientsService";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminClientForm">;

const BRAND_COLOR_OPTIONS = [colors.primary, colors.secondary, "#F2994A", "#27AE60", "#9B51E0", "#333333"];

export default function AdminClientFormScreen({ navigation, route }: Props) {
  const clientId = route.params?.clientId;
  const isEditing = Boolean(clientId);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [brandColor, setBrandColor] = useState(BRAND_COLOR_OPTIONS[0]);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!clientId) return;
    fetchClient(clientId)
      .then((client) => {
        setName(client.name);
        setEmail(client.email ?? "");
        setBrandColor(client.brandColor ?? BRAND_COLOR_OPTIONS[0]);
        setActive(client.active);
      })
      .catch(() => Alert.alert("Erro ao carregar cliente"))
      .finally(() => setLoading(false));
  }, [clientId]);

  async function handleSave() {
    if (!name.trim() || !email.trim() || (!isEditing && !password.trim())) {
      Alert.alert("Preencha nome, email" + (isEditing ? "" : " e senha") + ".");
      return;
    }
    setSaving(true);
    try {
      if (isEditing && clientId) {
        await updateClient(clientId, {
          name: name.trim(),
          email: email.trim(),
          brandColor,
          active,
          ...(password.trim() ? { password: password.trim() } : {}),
        });
      } else {
        await createClient({ name: name.trim(), email: email.trim(), password: password.trim(), brandColor });
      }
      navigation.goBack();
    } catch {
      Alert.alert("Não foi possível salvar", "Confira os dados e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!clientId) return;
    Alert.alert("Excluir cliente", "Isso remove o cliente e todos os posts dele. Confirma?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteClient(clientId);
            navigation.goBack();
          } catch {
            Alert.alert("Não foi possível excluir o cliente");
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nome</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nome do cliente" />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="email@cliente.com"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>{isEditing ? "Nova senha (opcional)" : "Senha"}</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder={isEditing ? "Deixe em branco para manter" : "Senha de acesso"}
        secureTextEntry
      />

      <Text style={styles.label}>Cor da marca</Text>
      <View style={styles.colorRow}>
        {BRAND_COLOR_OPTIONS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.colorDot, { backgroundColor: c }, brandColor === c && styles.colorDotActive]}
            onPress={() => setBrandColor(c)}
          />
        ))}
      </View>

      {isEditing && (
        <View style={styles.activeRow}>
          <Text style={styles.label}>Cliente ativo</Text>
          <Switch value={active} onValueChange={setActive} trackColor={{ true: colors.primary }} />
        </View>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Salvar</Text>}
      </TouchableOpacity>

      {isEditing && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Excluir cliente</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48, backgroundColor: colors.bgPage, flexGrow: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bgPage },
  label: { fontSize: 13, fontWeight: "700", color: colors.textMuted, marginTop: 16, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: colors.bgCard,
    color: colors.text,
  },
  colorRow: { flexDirection: "row", gap: 12 },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  colorDotActive: { borderWidth: 3, borderColor: colors.text },
  activeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 28,
  },
  saveButtonText: { color: "#fff", fontWeight: "600" },
  deleteButton: { alignItems: "center", padding: 14, marginTop: 12 },
  deleteButtonText: { color: colors.danger, fontWeight: "600" },
});
