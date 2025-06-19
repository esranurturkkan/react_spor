import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Drawer } from 'expo-router/drawer';

export default function RootLayout() {
  return (
    <Drawer>
      <Drawer.Screen
        name="index"
        options={{ title: 'Home', headerShown: false }}
      />
      <Drawer.Screen
        name="login"
        options={{ title: 'Login', headerShown: false }}
      />
      <Drawer.Screen
        name="register"
        options={{ title: 'Register', headerShown: false }}
      />
      <Drawer.Screen name="profile" options={{ title: 'Profile', headerShown: false }} />
      <Drawer.Screen name="goals" options={{ title: 'Goals', headerShown: false }} />
      <Drawer.Screen name="nutrition" options={{ title: 'Nutrition', headerShown: false }} />
      <Drawer.Screen name="calendar" options={{ title: 'Calendar', headerShown: false }} />
    </Drawer>
  );
}

