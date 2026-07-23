import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ServiceDetailScreen from './screens/ServiceDetailScreen';
import TeamScreen from './screens/TeamScreen';
import SongsScreen from './screens/SongsScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          
          if (route.name === 'Inicio') iconName = 'home';
          else if (route.name === 'Equipo') iconName = 'people';
          else if (route.name === 'Canciones') iconName = 'musical-notes';
          else if (route.name === 'Perfil') iconName = 'person';
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#5B5EA6',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Equipo" component={TeamScreen} />
      <Tab.Screen name="Canciones" component={SongsScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeTabs} options={{ headerShown: false }} />
        <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} options={{ title: 'Detalle del Servicio' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
