import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Para adicionar ícones

// Dados simulados para produtos no carrinho
const initialCartItems = [
  { id: 1, name: 'Produto 1', price: 19.99, imageUrl: 'https://via.placeholder.com/150' },
  { id: 2, name: 'Produto 2', price: 29.99, imageUrl: 'https://via.placeholder.com/150' },
  { id: 3, name: 'Produto 3', price: 39.99, imageUrl: 'https://via.placeholder.com/150' },
];

const cart: React.FC = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);

  // Função para remover um item do carrinho
  const removeItemFromCart = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Função para exibir alerta ao finalizar a compra
  const handleCheckout = () => {
    Alert.alert('Compra finalizada!', 'Obrigado por sua compra.');
    setCartItems([]); // Limpa o carrinho após a compra
  };

  const renderItem = ({ item }: { item: typeof cartItems[0] }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>R$ {item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={() => removeItemFromCart(item.id)}>
        <Ionicons name="trash" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Carrinho de Compras</Text>
      {cartItems.length > 0 ? (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.cartList}
          />
          <View style={styles.summary}>
            <Text style={styles.totalText}>Total: R$ {cartItems.reduce((total, item) => total + item.price, 0).toFixed(2)}</Text>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutButtonText}>Finalizar Compra</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text style={styles.emptyCartText}>Seu carrinho está vazio.</Text>
      )}
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

export default cart;
