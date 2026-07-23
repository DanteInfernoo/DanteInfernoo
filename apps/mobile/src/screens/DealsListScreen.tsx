import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { DealsStackParamList } from "../navigation/types";
import { useWorkspace } from "../lib/workspace-context";
import { listOpenDeals, type DealWithRelations } from "../lib/queries";
import { colors, EmptyState, LoadingView, RefreshableList } from "../components/ui";

type Props = NativeStackScreenProps<DealsStackParamList, "DealsList">;

export function DealsListScreen({ navigation }: Props) {
  const { workspace } = useWorkspace();
  const [deals, setDeals] = useState<DealWithRelations[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!workspace) return;
    setDeals(await listOpenDeals(workspace.id));
  }, [workspace]);

  useEffect(() => {
    load();
  }, [load]);

  if (deals === null) return <LoadingView />;

  return (
    <RefreshableList
      data={deals}
      keyExtractor={(item) => item.id}
      refreshing={refreshing}
      onRefresh={async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
      }}
      contentContainerStyle={deals.length === 0 ? styles.empty : styles.list}
      ListEmptyComponent={<EmptyState message="No open deals." />}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate("DealDetail", { id: item.id })}
        >
          <View style={styles.rowMain}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>
              {item.organization?.name ?? "No organization"}
              {item.person ? ` · ${item.person.name}` : ""}
            </Text>
          </View>
          <View style={styles.rowSide}>
            <Text style={styles.value}>
              {item.currency} {Number(item.value).toLocaleString()}
            </Text>
            <Text style={styles.stage}>{item.stage?.name ?? "—"}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 12, gap: 8 },
  empty: { flexGrow: 1 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginBottom: 8,
    marginHorizontal: 12,
  },
  rowMain: { flex: 1, paddingRight: 8 },
  title: { fontSize: 15, fontWeight: "600", color: colors.text },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 2 },
  rowSide: { alignItems: "flex-end" },
  value: { fontSize: 14, fontWeight: "600", color: colors.text },
  stage: { fontSize: 12, color: colors.accent, marginTop: 2 },
});
