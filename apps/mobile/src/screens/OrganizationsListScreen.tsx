import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OrganizationsStackParamList } from "../navigation/types";
import { useWorkspace } from "../lib/workspace-context";
import { listOrganizations, type OrganizationRow } from "../lib/queries";
import { colors, EmptyState, LoadingView, RefreshableList } from "../components/ui";

type Props = NativeStackScreenProps<OrganizationsStackParamList, "OrganizationsList">;

export function OrganizationsListScreen({ navigation }: Props) {
  const { workspace } = useWorkspace();
  const [query, setQuery] = useState("");
  const [organizations, setOrganizations] = useState<OrganizationRow[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (q: string) => {
      if (!workspace) return;
      setOrganizations(await listOrganizations(workspace.id, q || undefined));
    },
    [workspace],
  );

  useEffect(() => {
    load(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search organizations..."
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          load(text);
        }}
      />
      {organizations === null ? (
        <LoadingView />
      ) : (
        <RefreshableList
          data={organizations}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await load(query);
            setRefreshing(false);
          }}
          contentContainerStyle={organizations.length === 0 ? styles.empty : styles.list}
          ListEmptyComponent={<EmptyState message="No organizations found." />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() =>
                navigation.navigate("OrganizationDetail", { id: item.id })
              }
            >
              <Text style={styles.title}>{item.name}</Text>
              {item.account_type ? (
                <Text style={styles.subtitle}>{item.account_type}</Text>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  search: {
    margin: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  list: { paddingHorizontal: 12, paddingBottom: 12 },
  empty: { flexGrow: 1 },
  row: {
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginBottom: 8,
  },
  title: { fontSize: 15, fontWeight: "600", color: colors.text },
  subtitle: { fontSize: 12, color: colors.muted, marginTop: 2, textTransform: "capitalize" },
});
