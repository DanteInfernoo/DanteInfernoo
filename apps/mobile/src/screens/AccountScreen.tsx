import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../lib/auth-context";
import { useWorkspace } from "../lib/workspace-context";
import { colors } from "../components/ui";

export function AccountScreen() {
  const { session, signOut } = useAuth();
  const { workspace, memberships, selectWorkspace } = useWorkspace();

  return (
    <View style={styles.container}>
      <Text style={styles.email}>{session?.user.email}</Text>

      <Text style={styles.sectionHeading}>Workspace</Text>
      {memberships.map((m) => (
        <TouchableOpacity
          key={m.workspace.id}
          style={[
            styles.workspaceRow,
            workspace?.id === m.workspace.id && styles.workspaceRowActive,
          ]}
          onPress={() => selectWorkspace(m.workspace.id)}
        >
          <Text style={styles.workspaceName}>{m.workspace.name}</Text>
          <Text style={styles.role}>{m.role}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.signOut} onPress={signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20, gap: 8 },
  email: { fontSize: 15, color: colors.muted, marginBottom: 16 },
  sectionHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.muted,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  workspaceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginBottom: 8,
  },
  workspaceRowActive: {
    borderColor: colors.accent,
  },
  workspaceName: { fontSize: 15, fontWeight: "600", color: colors.text },
  role: { fontSize: 12, color: colors.muted, textTransform: "capitalize" },
  signOut: {
    marginTop: 24,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: "center",
  },
  signOutText: { color: colors.danger, fontWeight: "600" },
});
