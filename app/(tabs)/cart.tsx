import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Para adicionar ícones
import axios from 'axios';
import { getCookie } from '../services/CookieService';
import AwesomeAlert from 'react-native-awesome-alerts'; // Importando o AwesomeAlert
import { router } from 'expo-router';

// Definindo a interface para os itens do carrinho
interface CartItem {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    bar_code: string;
    qr_code: string;
    category: number;
    image: string;
  };
  quantity: number;
}

// Definindo a interface para o carrinho
interface Cart {
  user: number;
  cart_items: CartItem[];
  total_value: string;
}

const CartScreen: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalValue, setTotalValue] = useState<string>('0.00');
  const [showAlert, setShowAlert] = useState(false); // Estado para controlar a exibição do alerta
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Função para buscar os itens do carrinho da API
  const fetchCartItems = async () => {
    try {
      var token = await getCookie('access_token')
      var userId = await getCookie('id');
      const response = await axios.get('http://127.0.0.1:8000/cart/?user_id=' + userId, {
        headers: {
          Authorization: 'Bearer ' + token
        },
        validateStatus: () => true,
      });
      const data: Cart = response.data;
      setCartItems(data.cart_items);
      setTotalValue(data.total_value);
      setAccessToken(token);
    } catch (error) {
      console.error('Erro ao carregar os itens do carrinho:', error);
    }
  };

  // Função para remover um item do carrinho
  const removeItemFromCart = async (productId: number) => {
    var userId = await getCookie('id')
    try {
      var response = await axios.delete('http://127.0.0.1:8000/cart/item/delete',
        {
          data: {
            user_id: userId,
            product_id: productId,
          },
          headers: {
            'Authorization': 'Bearer ' + accessToken,
          },
        });

      if (response.status === 200) {
        fetchCartItems();
      }
      console.log(response)
    }
    catch (error) {
      console.log(error);
    }
  };

  // Função para exibir alerta ao finalizar a compra
  const handleCheckout = () => {
    setShowAlert(true); // Exibe o alerta de sucesso ao finalizar a compra
  };

  const cleanCart = async () => {
    var userId = await getCookie('id')

    try {
      var response = await axios.delete('http://127.0.0.1:8000/cart/delete?user_id=' + userId,
        {
          headers: {
            'Authorization': 'Bearer ' + accessToken,
          },
        });

      if (response.status === 200) {
        router.dismissAll()
        router.replace('/(tabs)/listProduct')
      }
      console.log(response)
    }
    catch (error) {
      console.log(error);
    }
  }

  // Função para renderizar cada item do carrinho
  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.product.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.product.name}</Text>
        <Text style={styles.itemPrice}>R$ {(item.product.price * item.quantity).toFixed(2)}</Text>
        <Text style={styles.itemQuantity}>Quantidade: {item.quantity}</Text>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => removeItemFromCart(item.product.id)}>
        <Ionicons name="trash" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  // Carregar os itens do carrinho assim que o componente for montado
  useEffect(() => {
    fetchCartItems();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Carrinho de Compras</Text>
      {cartItems.length > 0 ? (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.product.id.toString()}
            contentContainerStyle={styles.cartList}
          />
          <View style={styles.summary}>
            <Text style={styles.totalText}>Total: R$ {totalValue}</Text>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutButtonText}>Finalizar Compra</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text style={styles.emptyCartText}>Seu carrinho está vazio.</Text>
      )}

      {/* Alerta para erro ao carregar os itens */}
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title="Erro"
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showConfirmButton={true}
        confirmText="Ok"
        confirmButtonColor="#DD6B55"
        onConfirmPressed={() => setShowAlert(false)}
      />

      {/* Alerta para finalizar a compra com sucesso */}
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title="Compra Finalizada!"
        message="Obrigado por sua compra."
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showConfirmButton={true}
        confirmText="Ok"
        confirmButtonColor="#007b5e"
        onConfirmPressed={() => {
          cleanCart();
          setShowAlert(false);
          // setCartItems([]); // Limpa o carrinho após a compra
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  header: {
    textAlign: 'center',
    fontSize: 28,
    color: '#333',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  cartList: {
    paddingBottom: 10,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 16,
    color: '#007b5e',
    fontWeight: 'bold',
    marginTop: 5,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  removeButton: {
    padding: 10,
    backgroundColor: '#ff5252',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summary: {
    marginTop: 20,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  totalText: {
    fontSize: 22,
    color: '#333',
    fontWeight: '600',
  },
  checkoutButton: {
    marginTop: 15,
    paddingVertical: 15,
    paddingHorizontal: 40,
    backgroundColor: '#007b5e',
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyCartText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#777',
    marginTop: 20,
  },
});

export default CartScreen;
