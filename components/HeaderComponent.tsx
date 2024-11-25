import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useRouter, Link, usePathname } from 'expo-router';
import axios from 'axios';
import { deleteCookie, getCookie } from '@/services/CookieService';

const HeaderComponent: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isSuperUser, setIsSuperUser] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const isLoginOrRegisterPage = pathname.includes('login') || pathname.includes('register');

  const getUserInfo = async () => {
    const superUser = await getCookie('is_superuser');
    const userName = await getCookie('username');
    const userId = await getCookie('id');

    setIsSuperUser(superUser);
    setUsername(userName);
    setUserId(userId);
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  const handleLogout = async () => {
    const accessToken = await getCookie('access_token');
    const refreshToken = await getCookie('refresh_token');

    const response = await axios.post(
      'http://127.0.0.1:8000/auth/logout',
      { refresh: refreshToken },
      {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
        validateStatus: () => true,
      }
    );

    console.log(response);

    if (response.status === 200) {
      await deleteCookie('access_token');
      await deleteCookie('is_superuser');
      await deleteCookie('username');
      await deleteCookie('email');
      await deleteCookie('refresh_token');
      await deleteCookie('id');

      router.replace('/(tabs)/login');
    }
  };

  return (
    <View style={styles.header}>
      <Link href="/(tabs)/listProduct" style={styles.logo}>
        MW Store
      </Link>
      <View style={styles.navButtons}>
        {!isLoginOrRegisterPage && (
          <>
            {isSuperUser === 'true' ? (
              <View style={{ flexDirection: 'row' }}>
                <Link href="/(tabs)/listOrders" style={styles.navButton}>
                  <Text style={styles.navButtonText}>Pedidos</Text>
                </Link>
                <Link href="/(tabs)/listSupplier" style={styles.navButton}>
                  <Text style={styles.navButtonText}>Fornecedores</Text>
                </Link>
              </View>
            ) : null}

            <Link href="/(tabs)/showCart" style={styles.navButton}>
              <Text style={styles.navButtonText}>Carrinho</Text>
            </Link>

            {username && (
              <>
                <TouchableOpacity
                  style={styles.userButton}
                  onPress={() => setDropdownVisible(true)}
                >
                  <Text style={styles.userButtonText}>{username}</Text>
                </TouchableOpacity>

                {/* Dropdown Modal */}
                <Modal
                  visible={dropdownVisible}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setDropdownVisible(false)}
                >
                  <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={() => setDropdownVisible(false)}
                  >
                    <View style={styles.dropdown}>
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => {
                          setDropdownVisible(false);
                          router.push(`/(tabs)/listOrders?id=${userId}`);
                        }}
                      >
                        <Text style={styles.dropdownText}>Meus Pedidos</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => {
                          setDropdownVisible(false);
                          handleLogout();
                        }}
                      >
                        <Text style={styles.dropdownText}>Logout</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </Modal>
              </>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#007b5e',
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
    elevation: 3,
  },
  logo: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1.5,
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
  userButton: {
    marginLeft: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: '#005f47',
  },
  userButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    elevation: 5,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
});

export default HeaderComponent;
