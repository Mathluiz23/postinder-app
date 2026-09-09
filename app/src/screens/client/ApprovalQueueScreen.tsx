import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ClientStackParamList } from "../../navigation/types";
import { useApprovalQueue } from "../../hooks/useApprovalQueue";
import { createAuthenticatedPortalAdapter } from "../../services/portalAdapters";
import ApprovalQueueView from "../../components/ApprovalQueueView";

type Props = NativeStackScreenProps<ClientStackParamList, "ApprovalQueue">;

export default function ApprovalQueueScreen({ navigation }: Props) {
  const {
    loading,
    current,
    index,
    queue,
    adjustmentOpen,
    setAdjustmentOpen,
    handleApprove,
    handleReject,
  } = useApprovalQueue(createAuthenticatedPortalAdapter());

  return (
    <ApprovalQueueView
      loading={loading}
      current={current}
      index={index}
      total={queue.length}
      adjustmentOpen={adjustmentOpen}
      onOpenAdjustment={() => setAdjustmentOpen(true)}
      onCloseAdjustment={() => setAdjustmentOpen(false)}
      onApprove={handleApprove}
      onReject={handleReject}
      emptyState={
        <>
          <Text style={styles.emptyTitle}>Tudo em dia! 🎉</Text>
          <Text style={styles.emptySubtitle}>
            Não há posts pendentes de aprovação no momento.
          </Text>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate("History")}
          >
            <Text style={styles.historyButtonText}>Ver histórico</Text>
          </TouchableOpacity>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  emptyTitle: { fontSize: 22, fontWeight: "700" },
  emptySubtitle: { color: "#777", marginTop: 8, textAlign: "center" },
  historyButton: { marginTop: 24 },
  historyButtonText: { color: "#111", fontWeight: "600" },
});
