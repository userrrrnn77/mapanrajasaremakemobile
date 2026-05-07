import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { useAuthStore } from "../context/useAuthStore";

// Screens Bersama
import { LoginScreen } from "../screens/bersama/LoginScreen";
import { ProfileScreen } from "../screens/bersama/ProfileScreen";

// Cleaning Screens
import { DashboardCleaning } from "../screens/cleaning_service/DashboardCleaning";
import AttendanceCleaning from "../screens/cleaning_service/AttendanceCleaning";
import ActivityCleaning from "../screens/cleaning_service/ActivityCleaning";
import ReportCleaning from "../screens/cleaning_service/ReportCleaning";
import TimelineHistory from "../screens/cleaning_service/TimelineHistory";
import AIChatCleaning from "../screens/cleaning_service/AIChatCleaning";

// Admin Screens
import AdminDashboard from "../screens/admin/DashboardAdmin";
import ManajemenKaryawan from "../screens/admin/ManajemenKaryawan";
import RekapAbsen from "../screens/admin/RekapAbsen";
import LocationControl from "../screens/admin/AreaTempur";
import KotakLapor from "../screens/admin/KotakLapor";
import ManajemenAktivitas from "../screens/admin/ManajemenAktivitas";
import PusatLog from "../screens/admin/PusatLog";

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
        return (
          <>
            <Stack.Screen name="Dashboard" component={AdminDashboard} />
            <Stack.Screen name="UserManagement" component={ManajemenKaryawan} />
            <Stack.Screen name="LookAllAttendance" component={RekapAbsen} />
            <Stack.Screen name="LocationControl" component={LocationControl} />
            <Stack.Screen name="ReportCenter" component={KotakLapor} />
            <Stack.Screen
              name="LookAllActivity"
              component={ManajemenAktivitas}
            />
            <Stack.Screen name="LookAllLog" component={PusatLog} />
          </>
        );
      default:
        // Fallback kalau role belum turun dari langit
        return (
          <>
            <Stack.Screen name="Dashboard" component={DashboardCleaning} />
          </>
        );
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
