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
import { getCookie } from '../../services/CookieService';
import { getNewAccessToken } from '../../services/TokenService';
import AwesomeAlert from 'react-native-awesome-alerts';
import Icon from 'react-native-vector-icons/FontAwesome';


const screenWidth = Dimensions.get('window').width;
const numColumns = screenWidth > 600 ? 3 : 1;

const ListProduct: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSuperUser, setIsSuperUser] = useState<string | null>(null);

  const getSuperUser = async () => {
    let superUser = await getCookie('is_superuser');
    setIsSuperUser(superUser);
    console.log(superUser);
  }

  const fetchProducts = async () => {
    try {
      const accessToken = getCookie('access_token');
      if (accessToken !== null) {
        const products = await fetchWithToken(accessToken);
        if (products) {
          setAccessToken(accessToken);
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
          setAccessToken(newAccessToken);
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

  useEffect(() => {
    getSuperUser();
    fetchProducts();
  }, []);


  const handleAddtoCart = async (productId: number) => {
    try {
      var userId = await getCookie('id');
      console.log("userid", userId, "token", accessToken)
      const response = await axios.post('http://127.0.0.1:8000/cart/item/create',
        {
          "user_id": userId,
          "product_id": productId,
          "quantity": 1
        },
        {
          headers: {
            'Authorization': 'Bearer ' + accessToken,
          },
        })

      console.log(response);
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
    };
    setModalVisible(true);
  }

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
          <TouchableOpacity style={styles.buyNowButton} onPress={() => handleAddtoCart(item.id)}>
            <Text style={styles.buttonText}>Adicionar ao carrinho</Text>
          </TouchableOpacity>
        </View>
        {isSuperUser == 'true' ? (
          <View style={styles.actionIcons}>
            <TouchableOpacity style={styles.mr} onPress={() => editProduct(item.id)}>
              <Text>
                <Icon name="edit" size={24} color="#007b5e" />
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => confirmDeleteProduct(item.id)}>
              <Text>
                <Icon name="trash" size={23} color="#FF3B30" />
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

      </View>
    </View>
  );
  const editProduct = (id: number) => {
    router.dismissAll();
    router.replace(`/createProduct?id=${id}`);
  };

  const confirmDeleteProduct = (id: number) => {
    setAlertMessage('Tem certeza que deseja excluir este produto?');
    setAlertType('error');
    setShowAlert(true);
    setConfirmAction(() => async () => {
      try {
        await axios.delete(`http://127.0.0.1:8000/product/delete/${id}`, {
          headers: {
            'Authorization': 'Bearer ' + accessToken
          },
          validateStatus: () => true,
        });
        setAlertMessage('Produto excluído com sucesso.');
        setAlertType('success');
        setShowAlert(true);
        fetchProducts();
      } catch (error) {
        setAlertMessage('Não foi possível excluir o produto.');
        setAlertType('error');
        setShowAlert(true);
        console.error(error);
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Produtos</Text>
      {isSuperUser == 'true' ? (
        <Link style={styles.newProductBtn} href="/(tabs)/createProduct">
          <Text style={styles.txtNewProduct}>Novo produto</Text>
        </Link>
      ) : null}


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
                href="/(tabs)/showCart"
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
      <AwesomeAlert
        show={showAlert}
        title={alertType === 'success' ? 'Sucesso!' : alertType === 'error' ? 'Erro!' : 'Confirmação'}
        message={alertMessage}
        closeOnTouchOutside={alertType !== 'error'}
        closeOnHardwareBackPress={false}
        showCancelButton={alertType === 'error'}
        cancelText="Cancelar"
        cancelButtonColor="#aaa"
        showConfirmButton={true}
        confirmText={alertType === 'error' ? 'Excluir' : 'OK'}
        confirmButtonColor={alertType === 'success' ? '#4CAF50' : '#F44336'}
        onCancelPressed={() => setShowAlert(false)}
        onConfirmPressed={() => {
          if (confirmAction) {
            confirmAction();
            setConfirmAction(null);
          }
          setShowAlert(false);
        }}
      />
    </ScrollView>
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
    color: 'black',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 30,
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
    backgroundColor: '#007b5e',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },

  productItem: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    height: '100%',
    elevation: 3,
    ...(Platform.OS === 'web' && {
      margin: 13,
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

  txtNewProduct: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
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

  newProductBtn: {
    padding: 11,
    backgroundColor: '#007b5e',
    borderRadius: 5,
    alignItems: 'center',
    width: 130,
    marginBottom: 10,
    marginLeft: 30
  },

  actionIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
  },

  mr: {
    marginRight: 10
  }

});


export default ListProduct;
