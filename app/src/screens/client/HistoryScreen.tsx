import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { Post, PostStatus } from "../../types";
import { fetchClientPortal } from "../../services/postsService";
import { colors } from "../../theme/colors";
import { STATUS_LABEL } from "../../utils/statusLabels";

function isDecided(post: Post) {
  return post.status !== PostStatus.PENDING_APPROVAL && post.status !== PostStatus.DRAFT;
}

export default function HistoryScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientPortal()
      .then(({ posts }) => setPosts(posts.filter(isDecided)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            {item.positiveReaction === "loved" && (
              <Text style={styles.lovedTag}>Adorei ❤️</Text>
            )}
          </View>
          <Text style={styles.status}>{STATUS_LABEL[item.status] ?? item.status}</Text>
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>Nenhuma decisão registrada ainda.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bgPage },
  list: { padding: 16, backgroundColor: colors.bgPage, flexGrow: 1 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  title: { fontSize: 15, fontWeight: "600", color: colors.text },
  lovedTag: { fontSize: 12, color: colors.danger, marginTop: 2 },
  status: { fontSize: 13, color: colors.textMuted },
  empty: { textAlign: "center", color: colors.textMuted, marginTop: 40 },
});
