import React from "react";
import { Text, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useApprovalQueue } from "../../hooks/useApprovalQueue";
import { createPublicPortalAdapter } from "../../services/portalAdapters";
import ApprovalQueueView from "../../components/ApprovalQueueView";

type Props = NativeStackScreenProps<RootStackParamList, "PublicPortal">;

export default function PublicPortalScreen({ route }: Props) {
  const { token } = route.params;
  const adapter = React.useMemo(() => createPublicPortalAdapter(token), [token]);

  const {
    loading,
    current,
    index,
    queue,
    adjustmentOpen,
    setAdjustmentOpen,
    handleApprove,
    handleReject,
  } = useApprovalQueue(adapter, { pollIntervalMs: 30000 });

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
            Não há posts pendentes de aprovação neste link no momento.
          </Text>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  emptyTitle: { fontSize: 22, fontWeight: "700" },
  emptySubtitle: { color: "#777", marginTop: 8, textAlign: "center" },
});
