import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { DealsStackParamList } from "../navigation/types";
import { getDeal, type DealWithRelations } from "../lib/queries";
import { colors, LoadingView } from "../components/ui";

type Props = NativeStackScreenProps<DealsStackParamList, "DealDetail">;

export function DealDetailScreen({ route, navigation }: Props) {
  const [deal, setDeal] = useState<DealWithRelations | null | undefined>(undefined);

  useEffect(() => {
    getDeal(route.params.id).then(setDeal);
  }, [route.params.id]);

  useEffect(() => {
    if (deal) navigation.setOptions({ title: deal.title });
  }, [deal, navigation]);

  if (deal === undefined) return <LoadingView />;
  if (deal === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Deal not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{deal.title}</Text>
      <Text style={styles.value}>
        {deal.currency} {Number(deal.value).toLocaleString()}
      </Text>

      <View style={styles.section}>
        <Field label="Stage" value={deal.stage?.name ?? "—"} />
        <Field label="Status" value={deal.status} />
        <Field label="Organization" value={deal.organization?.name ?? "—"} />
        <Field label="Contact" value={deal.person?.name ?? "—"} />
        <Field
          label="Expected close"
          value={deal.expected_close_date ?? "—"}
        />
        {deal.lost_reason ? (
          <Field label="Lost reason" value={deal.lost_reason} />
        ) : null}
      </View>
    </ScrollView>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 4 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  muted: { color: colors.muted },
  title: { fontSize: 20, fontWeight: "700", color: colors.text },
  value: { fontSize: 16, color: colors.accent, marginTop: 4, marginBottom: 16 },
  section: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    gap: 12,
  },
  field: { gap: 2 },
  fieldLabel: { fontSize: 12, color: colors.muted, textTransform: "uppercase" },
  fieldValue: { fontSize: 15, color: colors.text },
});
