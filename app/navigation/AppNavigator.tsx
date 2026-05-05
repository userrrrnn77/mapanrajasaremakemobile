import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { useAuthStore } from "../context/useAuthStore";

// Screens
import { LoginScreen } from "../screens/bersama/LoginScreen";
import { DashboardCleaning } from "../screens/cleaning_service/DashboardCleaning";
import { ProfileScreen } from "../screens/bersama/ProfileScreen";
import AttendanceCleaning from "../screens/cleaning_service/AttendanceCleaning";
import ActivityCleaning from "../screens/cleaning_service/ActivityCleaning";
import ReportCleaning from "../screens/cleaning_service/ReportCleaning";
import TimelineHistory from "../screens/cleaning_service/TimelineHistory";
import AIChatCleaning from "../screens/cleaning_service/AIChatCleaning";
// Import screen lainnya yang tadi ada di Menu Bento
// import { FormAbsen } from "../screens/cleaning_service/FormAbsen";
// import { ChatAIScreen } from "../screens/cleaning_service/ChatAIScreen";

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { token, user, isAuthenticated } = useAuthStore();

  const renderRoleScreens = () => {
    switch (user?.role) {
      case "cleaning_service":
        return (
          <>
            <Stack.Screen name="Dashboard" component={DashboardCleaning} />
            <Stack.Screen name="FormAbsen" component={AttendanceCleaning} />
            <Stack.Screen name="FormAktivitas" component={ActivityCleaning} />
            <Stack.Screen name="FormLaporan" component={ReportCleaning} />
            <Stack.Screen name="RiwayatSaya" component={TimelineHistory} />
            <Stack.Screen name="ChatAIScreen" component={AIChatCleaning} />
          </>
        );
      case "security":
        // return <Stack.Screen name="Dashboard" component={DashboardSecurity} />;
        return null;
      case "admin":
        // return <Stack.Screen name="Dashboard" component={DashboardAdmin} />;
        return null;
      default:
        // Fallback kalau role belum turun dari langit
        return <Stack.Screen name="Dashboard" component={DashboardCleaning} />;
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}>
        {isAuthenticated && token ? (
          <>
            {/* 1. Dashboard dinamis sesuai role */}
            {renderRoleScreens()}

            {/* 2. Screen umum (bisa diakses semua role setelah login) */}
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        ) : (
          /* 3. Belum login */
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
