import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OrganizationsStackParamList } from "../navigation/types";
import {
  getOrganization,
  listPersonsForOrganization,
  type OrganizationRow,
  type PersonRow,
} from "../lib/queries";
import { colors, LoadingView } from "../components/ui";

type Props = NativeStackScreenProps<OrganizationsStackParamList, "OrganizationDetail">;

export function OrganizationDetailScreen({ route, navigation }: Props) {
  const [organization, setOrganization] = useState<OrganizationRow | null | undefined>(
    undefined,
  );
  const [persons, setPersons] = useState<PersonRow[]>([]);

  useEffect(() => {
    getOrganization(route.params.id).then(setOrganization);
    listPersonsForOrganization(route.params.id).then(setPersons);
  }, [route.params.id]);

  useEffect(() => {
    if (organization) navigation.setOptions({ title: organization.name });
  }, [organization, navigation]);

  if (organization === undefined) return <LoadingView />;
  if (organization === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Organization not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{organization.name}</Text>

      <View style={styles.section}>
        {organization.account_type ? (
          <Field label="Account type" value={organization.account_type} />
        ) : null}
        {organization.payment_terms ? (
          <Field label="Payment terms" value={organization.payment_terms} />
        ) : null}
      </View>

      <Text style={styles.sectionHeading}>Contacts</Text>
      {persons.length === 0 ? (
        <Text style={styles.muted}>No contacts yet.</Text>
      ) : (
        persons.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={styles.personRow}
            onPress={() => navigation.navigate("PersonDetail", { id: p.id })}
          >
            <Text style={styles.personName}>{p.name}</Text>
            {p.email ? <Text style={styles.muted}>{p.email}</Text> : null}
          </TouchableOpacity>
        ))
      )}
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
  container: { padding: 20, gap: 8 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  muted: { color: colors.muted },
  title: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 8 },
  section: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    gap: 12,
    marginBottom: 16,
  },
  field: { gap: 2 },
  fieldLabel: { fontSize: 12, color: colors.muted, textTransform: "uppercase" },
  fieldValue: { fontSize: 15, color: colors.text, textTransform: "capitalize" },
  sectionHeading: { fontSize: 13, fontWeight: "700", color: colors.muted, marginBottom: 8 },
  personRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  personName: { fontSize: 15, color: colors.text, fontWeight: "500" },
});
