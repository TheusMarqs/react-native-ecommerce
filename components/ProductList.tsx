import React, { useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, Modal, Dimensions, Platform } from 'react-native';
import { Link } from 'expo-router'; // Use o Link do expo-router

const screenWidth = Dimensions.get('window').width;
const numColumns = screenWidth > 600 ? 3 : 1;

const products = [
  { id: 1, name: 'Produto 1', price: 19.99, imageUrl: 'https://miro.medium.com/v2/resize:fit:1400/1*_RgA-j1Thj2roFdA3K-arA.png' },
  { id: 2, name: 'Produto 2', price: 29.99, imageUrl: 'data:image/jpeg;base64,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' },
  { id: 3, name: 'Produto 3', price: 39.99, imageUrl: 'data:image/jpeg;base64,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' },
  { id: 4, name: 'Produto 4', price: 49.99, imageUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*QY5S4senfFh-mIViSi5A_Q.png' },
  { id: 5, name: 'Produto 5', price: 59.99, imageUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*QY5S4senfFh-mIViSi5A_Q.png' },
  { id: 6, name: 'Produto 6', price: 69.99, imageUrl: 'https://miro.medium.com/v2/resize:fit:1200/1*QY5S4senfFh-mIViSi5A_Q.png' },
];

const ProductList: React.FC = () => {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleBuyNow = () => {
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: typeof products[0] }) => (
    <View
      style={[
        styles.productItem,
        hoveredItem === item.id && styles.productItemHovered,
      ]}
      onMouseEnter={() => setHoveredItem(item.id)}
      onMouseLeave={() => setHoveredItem(null)}
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
            onPress={handleBuyNow}
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
        numColumns={numColumns}
      />

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Produto adicionado ao carrinho!</Text>
            <Link href="/(tabs)/cart" style={styles.modalButton}
              onPress={() => setModalVisible(false)} 
            >
            
              <Text style={styles.modalButtonText}>Ir ao Carrinho</Text>
            </Link>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Continuar Comprando</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f4f4f4',
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
    ...(Platform.OS === 'web' && {
      margin: 10,
    }),
  },
  productItemHovered: {
    transform: [{ scale: 1.07 }],
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
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#007b5e',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ProductList;
