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
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AdminStackParamList } from "../../navigation/types";
import { ClientOverview, Post, PostFile } from "../../types";
import { createAdminPost, fetchAdminPost, updateAdminPost, NewPostFile } from "../../services/postsService";
import { fetchAdminClients } from "../../services/clientsService";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminCreatePost">;

const CHANNELS = [
  "Instagram/Facebook",
  "LinkedIn",
  "TikTok",
  "YouTube",
  "Google Meu Negócio",
  "WhatsApp",
  "Site",
  "E-mail Marketing",
];

export default function AdminCreatePostScreen({ navigation, route }: Props) {
  const postId = route.params?.postId;
  const isEditing = Boolean(postId);

  const [loading, setLoading] = useState(isEditing);
  const [clients, setClients] = useState<ClientOverview[]>([]);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [channels, setChannels] = useState<string[]>([]);
  const [existingFiles, setExistingFiles] = useState<PostFile[]>([]);
  const [files, setFiles] = useState<NewPostFile[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Post["feedback"]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      fetchAdminClients()
        .then(setClients)
        .catch(() => Alert.alert("Erro ao carregar clientes"));
      return;
    }
    fetchAdminPost(postId!)
      .then((post) => {
        setClientId(post.clientId);
        setClientName(post.clientName ?? post.clientId);
        setTitle(post.title);
        setDescription(post.description ?? "");
        setChannels(post.channels ?? []);
        setExistingFiles(post.files);
        setStatus(post.status);
        setFeedback(post.feedback ?? []);
      })
      .catch(() => Alert.alert("Erro ao carregar post"))
      .finally(() => setLoading(false));
  }, [isEditing, postId]);

  function toggleChannel(channel: string) {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  }

  async function pickFiles() {
    const result = await DocumentPicker.getDocumentAsync({ multiple: true, copyToCacheDirectory: true });
    if (result.canceled) return;
    setFiles((prev) => [
      ...prev,
      ...result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? "application/octet-stream",
      })),
    ]);
  }

  function removeFile(uri: string) {
    setFiles((prev) => prev.filter((f) => f.uri !== uri));
  }

  async function handleSubmit() {
    if (!title.trim() || channels.length === 0 || (!isEditing && !clientId)) {
      Alert.alert("Preencha cliente, título e ao menos um canal.");
      return;
    }
    setSubmitting(true);
    try {
      if (isEditing && postId) {
        await updateAdminPost(postId, {
          title: title.trim(),
          description: description.trim() || undefined,
          channels,
          newFiles: files,
        });
        Alert.alert("Post atualizado");
      } else {
        await createAdminPost({
          clientId: clientId!,
          title: title.trim(),
          description: description.trim() || undefined,
          channels,
          files,
        });
        Alert.alert("Post criado", "O cliente já foi notificado para aprovação.");
      }
      navigation.goBack();
    } catch {
      Alert.alert("Não foi possível salvar", "Confira os dados e tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (!postId) return;
    setResending(true);
    try {
      await updateAdminPost(postId, {
        title: title.trim(),
        description: description.trim() || undefined,
        channels,
        newFiles: files,
        status: "pending_approval",
      });
      Alert.alert("Post reenviado", "O cliente foi notificado para aprovar novamente.");
      navigation.goBack();
    } catch {
      Alert.alert("Não foi possível reenviar o post");
    } finally {
      setResending(false);
    }
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
      {status === "rejected" && feedback && feedback.length > 0 && (
        <View style={styles.feedbackBox}>
          <Text style={styles.feedbackTitle}>Ajuste solicitado pelo cliente</Text>
          {feedback.map((f) => (
            <View key={f.id} style={styles.feedbackItem}>
              <Text style={styles.feedbackComment}>"{f.comment}"</Text>
              {f.tags && f.tags.length > 0 && (
                <Text style={styles.feedbackTags}>{f.tags.join(", ")}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      <Text style={styles.label}>Cliente</Text>
      {isEditing ? (
        <View style={styles.readonlyBox}>
          <Text style={styles.readonlyText}>{clientName}</Text>
        </View>
      ) : (
        <View style={styles.chipRow}>
          {clients.map((client) => (
            <TouchableOpacity
              key={client.id}
              style={[styles.chip, clientId === client.id && styles.chipActive]}
              onPress={() => setClientId(client.id)}
            >
              <Text style={[styles.chipText, clientId === client.id && styles.chipTextActive]}>
                {client.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.label}>Título</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Título do post" />

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Descrição (opcional)"
        multiline
      />

      <Text style={styles.label}>Canais</Text>
      <View style={styles.chipRow}>
        {CHANNELS.map((channel) => (
          <TouchableOpacity
            key={channel}
            style={[styles.chip, channels.includes(channel) && styles.chipActive]}
            onPress={() => toggleChannel(channel)}
          >
            <Text style={[styles.chipText, channels.includes(channel) && styles.chipTextActive]}>
              {channel}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {existingFiles.length > 0 && (
        <>
          <Text style={styles.label}>Mídia já anexada</Text>
          {existingFiles.map((file) => (
            <View key={file.id} style={styles.fileRow}>
              <Text style={styles.fileName} numberOfLines={1}>
                {file.name}
              </Text>
              <Text style={styles.fileTypeTag}>{file.file_type}</Text>
            </View>
          ))}
        </>
      )}

      <Text style={styles.label}>{isEditing ? "Adicionar mídia" : "Mídia"}</Text>
      <TouchableOpacity style={styles.attachButton} onPress={pickFiles}>
        <Text style={styles.attachButtonText}>+ Anexar arquivo</Text>
      </TouchableOpacity>
      {files.map((file) => (
        <View key={file.uri} style={styles.fileRow}>
          <Text style={styles.fileName} numberOfLines={1}>
            {file.name}
          </Text>
          <TouchableOpacity onPress={() => removeFile(file.uri)}>
            <Text style={styles.removeFile}>Remover</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>
            {isEditing ? "Salvar alterações" : "Enviar para aprovação"}
          </Text>
        )}
      </TouchableOpacity>

      {isEditing && status === "rejected" && (
        <TouchableOpacity style={styles.resendButton} onPress={handleResend} disabled={resending}>
          {resending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.resendButtonText}>Reenviar para aprovação</Text>
          )}
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
  readonlyBox: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.bgPage,
    borderWidth: 1,
    borderColor: colors.border,
  },
  readonlyText: { color: colors.textMuted, fontWeight: "600" },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 13 },
  chipTextActive: { color: "#fff" },
  attachButton: {
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  attachButtonText: { fontWeight: "600", color: colors.secondaryDark },
  fileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  fileName: { flex: 1, marginRight: 8, color: colors.text },
  fileTypeTag: { color: colors.textMuted, fontSize: 12, textTransform: "uppercase" },
  removeFile: { color: colors.danger, fontSize: 13 },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  submitButtonText: { color: "#fff", fontWeight: "600" },
  feedbackBox: {
    backgroundColor: colors.primaryTint,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  feedbackTitle: { fontWeight: "700", color: colors.primaryDark, marginBottom: 6 },
  feedbackItem: { marginTop: 4 },
  feedbackComment: { color: colors.text, fontStyle: "italic" },
  feedbackTags: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  resendButton: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },
  resendButtonText: { color: "#fff", fontWeight: "600" },
});
