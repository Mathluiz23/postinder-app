import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors } from "../theme/colors";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string, tag?: string) => void;
}

const COMMON_TAGS = ["Cor/estilo", "Texto", "Enquadramento", "Outro"];

export default function AdjustmentModal({ visible, onClose, onSubmit }: Props) {
  const [reason, setReason] = useState("");
  const [tag, setTag] = useState<string | undefined>();

  function handleSubmit() {
    if (!reason.trim()) return;
    onSubmit(reason.trim(), tag);
    setReason("");
    setTag(undefined);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>O que precisa ajustar?</Text>

          <View style={styles.tagRow}>
            {COMMON_TAGS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tag, tag === t && styles.tagActive]}
                onPress={() => setTag(t)}
              >
                <Text style={[styles.tagText, tag === t && styles.tagTextActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.textArea}
            placeholder="Descreva o que precisa mudar..."
            multiline
            numberOfLines={4}
            value={reason}
            onChangeText={setReason}
          />

          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, !reason.trim() && styles.disabled]}
              onPress={handleSubmit}
              disabled={!reason.trim()}
            >
              <Text style={styles.submitText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: colors.text },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.bgPage,
  },
  tagActive: { backgroundColor: colors.primary },
  tagText: { color: colors.textMuted, fontSize: 13 },
  tagTextActive: { color: "#fff" },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    minHeight: 90,
    textAlignVertical: "top",
    color: colors.text,
  },
  buttonsRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  cancelButton: { flex: 1, padding: 14, alignItems: "center" },
  cancelText: { color: colors.textMuted },
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  disabled: { opacity: 0.4 },
  submitText: { color: "#fff", fontWeight: "600" },
});
