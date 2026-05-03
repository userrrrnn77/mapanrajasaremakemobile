import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { useAuthStore } from "../context/useAuthStore";

// Screens
import { LoginScreen } from "../screens/bersama/LoginScreen";
import { DashboardCleaning } from "../screens/cleaning_service/DashboardCleaning";
import { ProfileScreen } from "../screens/bersama/ProfileScreen";
// Import screen lainnya yang tadi ada di Menu Bento
// import { FormAbsen } from "../screens/cleaning_service/FormAbsen";
// import { ChatAIScreen } from "../screens/cleaning_service/ChatAIScreen";

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { token, user, isAuthenticated } = useAuthStore();

  console.log("CHECK AUTH:", {
    isAuthenticated,
    token: !!token,
    role: user?.role,
  });

  const renderRoleScreens = () => {
    switch (user?.role) {
      case "cleaning_service":
        return <Stack.Screen name="Dashboard" component={DashboardCleaning} />;
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
