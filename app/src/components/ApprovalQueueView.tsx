import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { TouchableOpacity } from "react-native";
import { Post } from "../types";
import PostMediaViewer from "./PostMediaViewer";
import AdjustmentModal from "./AdjustmentModal";
import { colors } from "../theme/colors";

interface Props {
  loading: boolean;
  current?: Post;
  index: number;
  total: number;
  adjustmentOpen: boolean;
  onOpenAdjustment: () => void;
  onCloseAdjustment: () => void;
  onApprove: (positiveReaction?: "loved") => void;
  onReject: (comment: string, tags?: string[]) => void;
  emptyState: React.ReactNode;
}

export default function ApprovalQueueView({
  loading,
  current,
  index,
  total,
  adjustmentOpen,
  onOpenAdjustment,
  onCloseAdjustment,
  onApprove,
  onReject,
  emptyState,
}: Props) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!current) {
    return <View style={styles.center}>{emptyState}</View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        {index + 1} de {total}
      </Text>

      <PostMediaViewer post={current} />

      <View style={styles.info}>
        <Text style={styles.postTitle}>{current.title}</Text>
        {current.description ? (
          <Text style={styles.postDescription}>{current.description}</Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.adjustButton]}
          onPress={onOpenAdjustment}
        >
          <Text style={styles.actionText}>Solicitar ajuste</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => onApprove()}
        >
          <Text style={styles.actionText}>Aprovar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.loveButton]}
          onPress={() => onApprove("loved")}
        >
          <Text style={styles.actionText}>Adorei ❤️</Text>
        </TouchableOpacity>
      </View>

      <AdjustmentModal
        visible={adjustmentOpen}
        onClose={onCloseAdjustment}
        onSubmit={(reason, tag) => onReject(reason, tag ? [tag] : undefined)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.bgPage },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.bgPage,
  },
  progress: { textAlign: "center", color: colors.textMuted, marginBottom: 8 },
  info: { marginTop: 16 },
  postTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  postDescription: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  actions: { flexDirection: "row", gap: 8, marginTop: 20 },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  adjustButton: { backgroundColor: colors.warning },
  approveButton: { backgroundColor: colors.success },
  loveButton: { backgroundColor: colors.primary },
  actionText: { color: "#fff", fontWeight: "600" },
});
