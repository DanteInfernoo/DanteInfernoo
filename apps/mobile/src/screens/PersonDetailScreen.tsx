import { useEffect, useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { PersonsStackParamList } from "../navigation/types";
import { getPerson, type PersonWithOrganization } from "../lib/queries";
import { colors, LoadingView } from "../components/ui";

type Props = NativeStackScreenProps<PersonsStackParamList, "PersonDetail">;

export function PersonDetailScreen({ route, navigation }: Props) {
  const [person, setPerson] = useState<PersonWithOrganization | null | undefined>(
    undefined,
  );

  useEffect(() => {
    getPerson(route.params.id).then(setPerson);
  }, [route.params.id]);

  useEffect(() => {
    if (person) navigation.setOptions({ title: person.name });
  }, [person, navigation]);

  if (person === undefined) return <LoadingView />;
  if (person === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Contact not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{person.name}</Text>

      <View style={styles.section}>
        {person.organization ? (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("OrganizationDetail", {
                id: person.organization!.id,
              })
            }
          >
            <Field label="Organization" value={person.organization.name} accent />
          </TouchableOpacity>
        ) : null}
        {person.email ? (
          <TouchableOpacity onPress={() => Linking.openURL(`mailto:${person.email}`)}>
            <Field label="Email" value={person.email} accent />
          </TouchableOpacity>
        ) : null}
        {person.phone ? (
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${person.phone}`)}>
            <Field label="Phone" value={person.phone} accent />
          </TouchableOpacity>
        ) : null}
      </View>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={[styles.fieldValue, accent && { color: colors.accent }]}>{value}</Text>
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
    gap: 14,
  },
  field: { gap: 2 },
  fieldLabel: { fontSize: 12, color: colors.muted, textTransform: "uppercase" },
  fieldValue: { fontSize: 15, color: colors.text },
});
