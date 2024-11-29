import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';  // Importando ícones do Ionicons
import HeaderComponent from '@/components/HeaderComponent';
import ListProduct from './listProduct';
import ShowCart from './showCart';
import AdminPage from './adminPage';
import ListOrders from './listOrders';

// Seus componentes de tela para as tabs
const Tab = createBottomTabNavigator();

const MobileNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (focused) {
            // Ícones ao estar na tela ativa
            iconName = 'home';  // Home
          } else {
            // Ícones ao estar na tela inativa
            iconName = 'cart';  // Meu carrinho
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',  // Cor do ícone ativo
        tabBarInactiveTintColor: 'gray',  // Cor do ícone inativo
      }}
    >
      <Tab.Screen
        name="Home"
        component={ListProduct}
        options={{
          tabBarLabel: 'Home',  // Rótulo da tab
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Meu carrinho"
        component={ShowCart}
        options={{
          tabBarLabel: 'Carrinho',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'cart' : 'cart-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AdminPage"
        component={AdminPage}
        options={{
          tabBarLabel: 'Admin',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Meus pedidos"
        component={ListOrders}
        options={{
          tabBarLabel: 'Pedidos',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default function Layout() {
  return (
    <View style={{ flex: 1 }}>
      {Platform.OS === 'web' ? (
        <Stack screenOptions={{ header: () => <HeaderComponent /> }} />
      ) : (
        <MobileNavigation />
      )}
    </View>
  );
}
