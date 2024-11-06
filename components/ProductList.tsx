import React, { useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, Alert, Dimensions, Platform } from 'react-native';

// Detectando a largura da tela
const screenWidth = Dimensions.get('window').width;

// Ajuste o número de colunas com base na largura da tela
const numColumns = screenWidth > 600 ? 3 : 1; // 600px é o limite para considerar como web, ajuste conforme necessário

// Simulação de produtos com mais opções e imagens
const products = [
  { id: 1, name: 'Produto 1', price: 19.99, imageUrl: 'https://via.placeholder.com/150' },
  { id: 2, name: 'Produto 2', price: 29.99, imageUrl: 'https://via.placeholder.com/150' },
  { id: 3, name: 'Produto 3', price: 39.99, imageUrl: 'https://via.placeholder.com/150' },
  { id: 4, name: 'Produto 4', price: 49.99, imageUrl: 'https://via.placeholder.com/150' },
  { id: 5, name: 'Produto 5', price: 59.99, imageUrl: 'https://via.placeholder.com/150' },
  { id: 6, name: 'Produto 6', price: 69.99, imageUrl: 'https://via.placeholder.com/150' },
];

const ProductList: React.FC = () => {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const handleBuyNow = (productName: string) => {
    Alert.alert(
      'Compra Iniciada!',
      `Você iniciou a compra de ${productName}.`,
      [{ text: 'Fechar' }],
    );
  };

  const renderItem = ({ item }: { item: typeof products[0] }) => (
    <View
      style={[
        styles.productItem,
        hoveredItem === item.id && styles.productItemHovered,
      ]}
      onMouseEnter={() => setHoveredItem(item.id)}  // Detectar hover
      onMouseLeave={() => setHoveredItem(null)}    // Remover hover
    >
      <View style={styles.productImageWrapper}>
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} resizeMode="cover" />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>R${item.price.toFixed(2)}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.buyNowButton}
            onPress={() => handleBuyNow(item.name)}
          >
            <Text style={styles.buttonText}>Adicionar ao carrinho</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Produtos</Text>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.productList}
        numColumns={numColumns} // Número de colunas ajustado dinamicamente
      />
    </View>
  );
};

// Estilos aprimorados para botões mais baixos e compactos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f4f4f4',
    // Adicionando padding apenas para web
    ...(Platform.OS === 'web' && {
      paddingLeft: 80,
      paddingRight: 80,
    }),
  },
  header: {
    textAlign: 'center',
    fontSize: 24,
    color: '#333',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  productList: {
    paddingBottom: 10,
  },
  productItem: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    transition: 'transform 0.3s ease', // Adicionando transição suave para zoom
    ...(Platform.OS === 'web' && {
      margin: 10,
    }),
  },
  productItemHovered: {
    transform: [{ scale: 1.07 }], // Efeito de zoom quando o hover é ativado
  },
  productImageWrapper: {
    width: '100%',
    aspectRatio: 1,
    height: 180,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    padding: 5,
    alignItems: 'center',
    height: 150,
  },
  productName: {
    fontSize: 22,
    color: '#333',
    fontWeight: '600',
    marginVertical: 2,
    textAlign: 'center',
    marginTop: 7,
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 18,
    color: '#007b5e',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 7,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  buyNowButton: {
    flex: 1,
    padding: 11,
    backgroundColor: '#007b5e',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
  },
});

export default ProductList;
