import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';

import ChatScreen from './src/components/ChatScreen';
import MemoryScreen from './src/components/MemoryScreen';
import { THEME } from './src/utils/constants';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let icon = '💬';

            if (route.name === '对话') {
              icon = '💬';
            } else if (route.name === '记忆') {
              icon = '🧠';
            }

            return <Text style={{ fontSize: size }}>{icon}</Text>;
          },
          tabBarActiveTintColor: THEME.primaryColor,
          tabBarInactiveTintColor: 'gray',
          headerStyle: {
            backgroundColor: THEME.primaryColor,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen name="对话" component={ChatScreen} />
        <Tab.Screen name="记忆" component={MemoryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}