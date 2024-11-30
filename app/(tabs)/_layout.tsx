import React, { useEffect, useState } from 'react';
import { Platform, View, TouchableOpacity, Text } from 'react-native';
import { router, Stack, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';  // Importando ícones do Ionicons
import HeaderComponent from '@/components/HeaderComponent';
import { deleteCookie, getCookie } from '@/services/CookieService';
import axios from 'axios';

export default function Layout() {
  const [isSuperUser, setIsSuperUser] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const getUserInfo = async () => {
    const superUser = await getCookie('is_superuser');
    const userId = await getCookie('id');

    setIsSuperUser(superUser);
    setUserId(userId);
  };

  const LogoutButton = ({ onPress }: { onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{ marginRight: 15, padding: 10, backgroundColor: 'tomato', borderRadius: 5 }}
    >
      <Text style={{ color: 'white', fontWeight: 'bold' }}>Sair</Text>
    </TouchableOpacity>
  );

  const handleLogout = async () => {
    const accessToken = await getCookie('access_token');
    const refreshToken = await getCookie('refresh_token');

    const response = await axios.post(
      'https://backend-pm.onrender.com/auth/logout',
      { refresh: refreshToken },
      {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
        validateStatus: () => true,
      }
    );

    if (response.status === 200) {
      await deleteCookie('access_token');
      await deleteCookie('is_superuser');
      await deleteCookie('username');
      await deleteCookie('email');
      await deleteCookie('refresh_token');
      await deleteCookie('id');

      router.dismissAll();
      router.replace('/(tabs)/login');
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {Platform.OS === 'web' ? (
        <Stack screenOptions={{ header: () => <HeaderComponent /> }} />
      ) : (
        <Tabs
          screenOptions={({ route }) => {
            const isLoginOrRegister = route.name === 'login' || route.name === 'register';

            return {
              tabBarIcon: ({ focused, color, size }) => {
                let iconName: string;
                switch (route.name) {
                  case 'listProduct':
                    iconName = focused ? 'home' : 'home-outline';
                    break;
                  case 'showCart':
                    iconName = focused ? 'cart' : 'cart-outline';
                    break;
                  case 'adminPage':
                    iconName = focused ? 'settings' : 'settings-outline';
                    break;
                  case 'listOrders':
                    iconName = focused ? 'list' : 'list-outline';
                    break;
                  default:
                    iconName = 'ellipse';
                }
                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: 'tomato',
              tabBarInactiveTintColor: 'gray',
              tabBarLabelStyle: { fontSize: 12 },
              headerRight: !isLoginOrRegister ? () => <LogoutButton onPress={() => handleLogout()} /> : undefined,
            };
          }}
        >
          <Tabs.Screen
            name="listProduct"
            options={{
              tabBarLabel: 'Home',
              title: 'Lista de Produtos',
            }}
          />
          <Tabs.Screen
            name="showCart"
            options={{
              tabBarLabel: 'Carrinho',
              title: 'Meu carrinho',
            }}
          />
          {isSuperUser === 'true' ? (
            <Tabs.Screen
              name="adminPage"
              options={{
                tabBarLabel: 'Admin',
                title: 'Painel administrativo',
              }}
            />
          ) : (
            <Tabs.Screen
              name="adminPage"
              options={{
                href: null,
              }}
            />
          )}

          <Tabs.Screen
            name="listOrders"
            options={{
              tabBarLabel: 'Meus Pedidos',
              href: `/listOrders?id=${userId}`,
              title: 'Meus Pedidos',
            }}
          />
          <Tabs.Screen
            name="index"
            options={{
              href: null,
              title: 'Bem vindo!',
            }}
          />
          <Tabs.Screen
            name="login"
            options={{
              href: null,
              tabBarStyle: { display: 'none' },
              title: 'Login',
            }}
          />
          <Tabs.Screen
            name="register"
            options={{
              href: null,
              tabBarStyle: { display: 'none' },
              title: 'Cadastro',
            }}
          />
          <Tabs.Screen
            name="adminChat"
            options={{
              href: null,
              title: 'Todas as mensagens',
            }}
          />
          <Tabs.Screen
            name="finishOrder"
            options={{
              href: null,
              title: 'Finalizar compra',
            }}
          />
          <Tabs.Screen
            name="viewProduct"
            options={{
              href: null,
              title: 'Visualizar produto',
            }}
          />
          <Tabs.Screen
            name="listCategory"
            options={{
              href: null,
              title: 'Lista de Categorias',
            }}
          />
          <Tabs.Screen
            name="listSupplier"
            options={{
              href: null,
              title: 'Lista de Fornecedores',
            }}
          />
          <Tabs.Screen
            name="createProduct"
            options={{
              href: null,
              title: 'Cadastrar produtos',
            }}
          />
          <Tabs.Screen
            name="createCategory"
            options={{
              href: null,
              title: 'Cadastrar categorias',
            }}
          />
          <Tabs.Screen
            name="createSupplier"
            options={{
              href: null,
              title: 'Cadastrar fornecedores',
            }}
          />
        </Tabs>
      )}
    </View>
  );
}
