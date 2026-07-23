import { useCallback, useEffect, useState } from "react";
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useWorkspace } from "../lib/workspace-context";
import {
  listDueActivities,
  listUpcomingActivities,
  setActivityDone,
  type ActivityWithRelations,
} from "../lib/queries";
import { colors, EmptyState, LoadingView } from "../components/ui";

interface Section {
  title: string;
  data: ActivityWithRelations[];
}

export function ActivitiesListScreen() {
  const { workspace } = useWorkspace();
  const [sections, setSections] = useState<Section[] | null>(null);

  const load = useCallback(async () => {
    if (!workspace) return;
    const [due, upcoming] = await Promise.all([
      listDueActivities(workspace.id),
      listUpcomingActivities(workspace.id),
    ]);
    const next: Section[] = [];
    if (due.length > 0) next.push({ title: "Due", data: due });
    if (upcoming.length > 0) next.push({ title: "Upcoming", data: upcoming });
    setSections(next);
  }, [workspace]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggleDone(activity: ActivityWithRelations) {
    await setActivityDone(activity.id, true);
    await load();
  }

  if (sections === null) return <LoadingView />;

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      contentContainerStyle={sections.length === 0 ? styles.empty : styles.list}
      ListEmptyComponent={<EmptyState message="Nothing due — you're all caught up." />}
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionHeader}>{section.title}</Text>
      )}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => handleToggleDone(item)}
          >
            <Text style={styles.checkboxMark}> </Text>
          </TouchableOpacity>
          <View style={styles.rowMain}>
            <Text style={styles.title}>{item.subject}</Text>
            <Text style={styles.subtitle}>
              {item.type?.name ?? "Activity"} · due {item.due_date}
              {item.organization ? ` · ${item.organization.name}` : ""}
              {item.deal ? ` · ${item.deal.title}` : ""}
            </Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 12 },
  empty: { flexGrow: 1 },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.muted,
    marginTop: 12,
    marginBottom: 6,
    marginHorizontal: 4,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginBottom: 8,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxMark: { fontSize: 12 },
  rowMain: { flex: 1 },
  title: { fontSize: 15, fontWeight: "600", color: colors.text },
  subtitle: { fontSize: 12, color: colors.muted, marginTop: 2 },
});
