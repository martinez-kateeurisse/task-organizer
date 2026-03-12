import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { FONTS, P } from "../../constants/theme";
import { TaskProvider, useTasks } from "../../context/TaskContext";

// ─── TAB LAYOUT ───────────────────────────────────────────────────────────────
// Registers all 5 tabs and wraps them in TaskProvider so every screen
// shares the same task list without passing props through each level.
//
// Ionicons comes bundled with Expo — no install needed.
// Each tab needs a `name` matching its filename in app/(tabs)/.

// Separate inner component so it can call useTasks() which needs to be inside TaskProvider
function TabsWithLoader() {
  const { loading } = useTasks();

  // While AsyncStorage is loading, show a centered spinner instead of the blank app
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: P.lilac,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={P.plum} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // we draw our own header inside each screen
        tabBarActiveTintColor: P.plum,
        tabBarInactiveTintColor: P.textSoft,
        tabBarStyle: {
          backgroundColor: P.white,
          borderTopColor: P.border,
          borderTopWidth: 1,
          paddingTop: 6,
          height: 70,
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.sansBold,
          fontSize: 10,
          letterSpacing: 0.4,
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add-task"
        options={{
          title: "Add",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "add-circle" : "add-circle-outline"}
              size={26}
              color={focused ? P.plum : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "bar-chart" : "bar-chart-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <TaskProvider>
      <TabsWithLoader />
    </TaskProvider>
  );
}
