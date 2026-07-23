import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View, StyleSheet } from "react-native";
import { useAuth } from "../lib/auth-context";
import { useWorkspace } from "../lib/workspace-context";
import { LoginScreen } from "../screens/LoginScreen";
import { DealsListScreen } from "../screens/DealsListScreen";
import { DealDetailScreen } from "../screens/DealDetailScreen";
import { OrganizationsListScreen } from "../screens/OrganizationsListScreen";
import { OrganizationDetailScreen } from "../screens/OrganizationDetailScreen";
import { PersonsListScreen } from "../screens/PersonsListScreen";
import { PersonDetailScreen } from "../screens/PersonDetailScreen";
import { ActivitiesListScreen } from "../screens/ActivitiesListScreen";
import { AccountScreen } from "../screens/AccountScreen";
import { LoadingView, colors } from "../components/ui";
import type {
  DealsStackParamList,
  OrganizationsStackParamList,
  PersonsStackParamList,
  MainTabParamList,
} from "./types";

const DealsStack = createNativeStackNavigator<DealsStackParamList>();
const OrganizationsStack = createNativeStackNavigator<OrganizationsStackParamList>();
const PersonsStack = createNativeStackNavigator<PersonsStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function DealsNavigator() {
  return (
    <DealsStack.Navigator>
      <DealsStack.Screen
        name="DealsList"
        component={DealsListScreen}
        options={{ title: "Deals" }}
      />
      <DealsStack.Screen name="DealDetail" component={DealDetailScreen} options={{ title: "" }} />
    </DealsStack.Navigator>
  );
}

function OrganizationsNavigator() {
  return (
    <OrganizationsStack.Navigator>
      <OrganizationsStack.Screen
        name="OrganizationsList"
        component={OrganizationsListScreen}
        options={{ title: "Organizations" }}
      />
      <OrganizationsStack.Screen
        name="OrganizationDetail"
        component={OrganizationDetailScreen}
        options={{ title: "" }}
      />
      <OrganizationsStack.Screen
        name="PersonDetail"
        component={PersonDetailScreen}
        options={{ title: "" }}
      />
    </OrganizationsStack.Navigator>
  );
}

function PersonsNavigator() {
  return (
    <PersonsStack.Navigator>
      <PersonsStack.Screen
        name="PersonsList"
        component={PersonsListScreen}
        options={{ title: "Contacts" }}
      />
      <PersonsStack.Screen name="PersonDetail" component={PersonDetailScreen} options={{ title: "" }} />
      <PersonsStack.Screen
        name="OrganizationDetail"
        component={OrganizationDetailScreen}
        options={{ title: "" }}
      />
    </PersonsStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="Deals" component={DealsNavigator} />
      <Tabs.Screen name="Organizations" component={OrganizationsNavigator} />
      <Tabs.Screen name="Persons" component={PersonsNavigator} />
      <Tabs.Screen
        name="Activities"
        component={ActivitiesListScreen}
        options={{ headerShown: true, title: "Activities" }}
      />
      <Tabs.Screen
        name="Account"
        component={AccountScreen}
        options={{ headerShown: true, title: "Account" }}
      />
    </Tabs.Navigator>
  );
}

function NoWorkspace() {
  return (
    <View style={styles.center}>
      <Text style={styles.text}>
        Your account isn't a member of any workspace yet.
      </Text>
    </View>
  );
}

export function RootNavigator() {
  const { session, loading: authLoading } = useAuth();
  const { workspace, memberships, loading: workspaceLoading } = useWorkspace();

  return (
    <NavigationContainer>
      {authLoading ? (
        <LoadingView />
      ) : !session ? (
        <LoginScreen />
      ) : workspaceLoading ? (
        <LoadingView />
      ) : !workspace && memberships.length === 0 ? (
        <NoWorkspace />
      ) : (
        <MainTabs />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  text: { fontSize: 15, color: colors.muted, textAlign: "center" },
});
