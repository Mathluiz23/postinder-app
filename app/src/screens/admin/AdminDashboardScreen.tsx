import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AdminStackParamList } from "../../navigation/types";
import { fetchAdminClients, fetchMetrics } from "../../services/clientsService";
import { getUser } from "../../services/authStore";
import { ClientOverview, Metrics } from "../../types";
import { STATUS_LABEL } from "../../utils/statusLabels";
import { colors } from "../../theme/colors";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminDashboard">;

function initialsOf(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AdminDashboardScreen({ navigation }: Props) {
  const [clients, setClients] = useState<ClientOverview[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  const load = useCallback(() => {
    Promise.all([fetchAdminClients(), fetchMetrics()])
      .then(([clientsData, metricsData]) => {
        setClients(clientsData);
        setMetrics(metricsData);
      })
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <View style={styles.userBar}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initialsOf(user?.name)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{user?.name ?? "Agência"}</Text>
                <Text style={styles.userRole}>AGÊNCIA</Text>
              </View>
            </View>

            {metrics && (
              <View style={styles.metricsCard}>
                <Text style={styles.metricsTitle}>{metrics.totalPosts} posts no total</Text>
                <View style={styles.metricsRow}>
                  {Object.entries(metrics.totalsByStatus).map(([status, count]) => (
                    <TouchableOpacity
                      key={status}
                      style={styles.metricTile}
                      onPress={() =>
                        navigation.navigate("AdminPostsByStatus", {
                          status,
                          label: STATUS_LABEL[status] ?? status,
                        })
                      }
                    >
                      <Text style={styles.metricCount}>{count}</Text>
                      <Text style={styles.metricLabel}>{STATUS_LABEL[status] ?? status}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.queueButton}
              onPress={() => navigation.navigate("AdminQueue")}
            >
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.queueButtonText}>Ver fila consolidada de aprovações</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate("AdminCreatePost", {})}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.primaryDark} />
              <Text style={styles.createButtonText}>Novo post</Text>
            </TouchableOpacity>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Clientes</Text>
              <TouchableOpacity onPress={() => navigation.navigate("AdminClientForm", {})}>
                <Text style={styles.newClientLink}>+ Novo cliente</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("AdminClientForm", { clientId: item.id })}
          >
            <View style={[styles.colorDot, { backgroundColor: item.brandColor ?? colors.border }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.clientName}>{item.name}</Text>
              <Text style={styles.clientMeta}>{item.active ? "Ativo" : "Inativo"}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum cliente cadastrado ainda.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPage },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bgPage },
  userBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.primaryDark,
    padding: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  userName: { color: "#fff", fontWeight: "700", fontSize: 15 },
  userRole: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  metricsCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricsTitle: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 12 },
  metricsRow: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  metricTile: { minWidth: 64 },
  metricCount: { fontSize: 20, fontWeight: "700", color: colors.primary },
  metricLabel: { fontSize: 12, color: colors.textMuted },
  queueButton: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primaryDark,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  queueButtonText: { color: "#fff", fontWeight: "600" },
  createButton: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 16,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  createButtonText: { color: colors.primaryDark, fontWeight: "600" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  newClientLink: { color: colors.secondary, fontWeight: "600" },
  list: { paddingBottom: 24 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorDot: { width: 14, height: 14, borderRadius: 7 },
  clientName: { fontSize: 16, fontWeight: "700", color: colors.text },
  clientMeta: { color: colors.textMuted, marginTop: 4, fontSize: 13 },
  empty: { textAlign: "center", color: colors.textMuted, marginTop: 40 },
});
