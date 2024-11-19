import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, Link, usePathname } from 'expo-router';

const HeaderComponent: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname(); // Usando o usePathname do expo-router

  // Condição para não mostrar os botões na página de login e cadastro
  const isLoginOrRegisterPage = pathname.includes('login') || pathname.includes('register');

  // Função para lidar com o logout
  const handleLogout = () => {
    //document.cookie =
      //'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.replace('/(tabs)/login');
  };

  return (
    <View style={styles.header}>
      <Link href="/(tabs)/listProduct" style={styles.logo}>MW Store</Link>
      <View style={styles.navButtons}>
        {/* Exibe os botões apenas se não for a página de login ou cadastro */}
        {!isLoginOrRegisterPage && (
          <>
            <Link href="/(tabs)/cart" style={styles.navButton}>
              <Text style={styles.navButtonText}>Carrinho</Text>
            </Link>
            <TouchableOpacity
              style={[styles.logoutButton]}
              onPress={handleLogout} // Usando a função externa
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#007b5e', // Cor principal
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3, // Sombra no Android
  },
  logo: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    flex: 1,
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    marginLeft: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  logoutButton: {
    marginLeft: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: '#d9534f',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default HeaderComponent;
