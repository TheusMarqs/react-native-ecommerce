import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import axios from 'axios';
import { getCookie } from '../services/CookieService';
import { getNewAccessToken } from '../services/TokenService';

const screenWidth = Dimensions.get('window').width;
const numColumns = screenWidth > 600 ? 3 : 1;

const ListProduct: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Função para buscar os produtos da API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const accessToken = getCookie('access_token');
        if (accessToken !== null) {
          const products = await fetchWithToken(accessToken);
          if (products) {
            setProducts(products);
          }
        } else {
          console.log('No access token available');
          handleInvalidToken();
        }
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      }
    };

    const fetchWithToken = async (token: string) => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/product/', {
          headers: {
            'Authorization': 'Bearer ' + token,
          },
          validateStatus: () => true,
        });

        if (response.status === 200) {
          console.log('Products received');
          return response.data;
        } else if (response.status === 401) {
          console.log('Access token expired, refreshing...');
          const newAccessToken = await getNewAccessToken();
          if (newAccessToken) {
            return await fetchWithToken(newAccessToken); // Refaça a requisição com o novo token
          } else {
            console.log('Refresh token invalid, redirecting to login...');
            handleInvalidToken();
          }
        } else {
          console.log(`Unexpected response status: ${response.status}`);
          return null;
        }
      } catch (error) {
        console.error('Erro na requisição:', error);
        return null;
      }
    };

    const handleInvalidToken = () => {
      router.dismissAll();
      router.replace('/(tabs)/');
    };

    fetchProducts();
  }, []);

  const handleBuyNow = () => {
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View
      style={[
        styles.productItem,
        hoveredItem === item.id && styles.productItemHovered,
      ]}
      onMouseEnter={() => setHoveredItem(item.id)}
      onMouseLeave={() => setHoveredItem(null)}
    >
      <TouchableOpacity>
        <Link href={`/(tabs)/viewProduct?id=${item.id}`}>
          <View style={styles.productImageWrapper}>
            <Image
              source={{ uri: 'http://127.0.0.1:8000' + item.image }}
              style={styles.productImage}
              resizeMode="cover"
            />
          </View>
        </Link>
      </TouchableOpacity>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>R${item.price.toFixed(2)}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
            <Text style={styles.buttonText}>Adicionar ao carrinho</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header com Botões */}


      {/* Lista de Produtos */}
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.productList}
        numColumns={numColumns}
      />

      {/* Modal de Compra */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Produto adicionado ao carrinho!</Text>
            <TouchableOpacity style={styles.modalButton}>
              <Link
                href="/(tabs)/cart"
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Ir ao Carrinho</Text>
              </Link>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
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
    backgroundColor: '#f4f4f4',
  },
  header: {
    backgroundColor: '#007b5e',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  actionButtonText: {
    color: '#007b5e',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#d9534f',
  },
  productList: {
    paddingHorizontal: 10,
    paddingBottom: 10,
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
  modalButton: {
    marginTop: 10,
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

  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cartButton: {
    backgroundColor: '#007b5e',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 10,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
});


export default ListProduct;
