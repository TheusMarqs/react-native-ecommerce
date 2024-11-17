import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, Modal, Dimensions, Platform } from 'react-native';
import { Link } from 'expo-router'; // Use o Link do expo-router
import axios from 'axios';

const screenWidth = Dimensions.get('window').width;
const numColumns = screenWidth > 600 ? 3 : 1;

const ProductList: React.FC = () => {
  const [products, setProducts] = useState([]);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Função para buscar os produtos da API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/product/',
          {
            headers: {
              'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMxODEzNDI4LCJpYXQiOjE3MzE4MDk4MjgsImp0aSI6Ijg5MTdmNjVmYjI3MjRjY2ViYmU4NzZkNzEyYTE5NjM1IiwidXNlcl9pZCI6MX0.IxWJbeptzkysDvWAfjzsIlx5k-BsE2BMnk5H9HqbUaA'
            }
          }
        );
        console.log(response.data);
        setProducts(response.data);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      }
    };

    fetchProducts();
  }, []);

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
        <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
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
      {/* Botão para ir para a página de login */}
      <Link href="/(tabs)/login" style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Acessar Login</Text>
      </Link>
      <Link href="/(tabs)/createProduct" style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Cadastrar produto</Text>
      </Link>
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
  loginButton: {
    backgroundColor: '#007b5e',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'flex-end',
    marginRight: 10,
    marginBottom: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductList;
