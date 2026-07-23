import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type ScrollViewProps,
} from "react-native";
import { FlatList, type FlatListProps } from "react-native";

export const colors = {
  bg: "#ffffff",
  border: "#e5e7eb",
  text: "#111827",
  muted: "#6b7280",
  accent: "#2563eb",
  danger: "#dc2626",
  warn: "#d97706",
};

export function Screen({ children }: { children: React.ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

export function LoadingView() {
  return (
    <View style={styles.center}>
      <ActivityIndicator />
    </View>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.muted}>{message}</Text>
    </View>
  );
}

export function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <View style={[styles.badge, color ? { backgroundColor: `${color}22` } : null]}>
      <Text style={[styles.badgeText, color ? { color } : null]}>{label}</Text>
    </View>
  );
}

interface RefreshableListProps<T> extends Omit<FlatListProps<T>, "refreshControl"> {
  refreshing: boolean;
  onRefresh: () => void;
}

export function RefreshableList<T>({
  refreshing,
  onRefresh,
  ...rest
}: RefreshableListProps<T>) {
  return (
    <FlatList
      {...rest}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}

export function ScrollScreen({
  children,
}: {
  children: React.ReactNode;
} & ScrollViewProps) {
  return <View style={styles.screen}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  muted: {
    color: colors.muted,
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
});
