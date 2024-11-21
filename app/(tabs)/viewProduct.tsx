import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getCookie } from '../services/CookieService';
import axios from 'axios';
import { getNewAccessToken } from '../services/TokenService';

const ViewProduct: React.FC = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1); // Default quantity
  const params = useLocalSearchParams();
  const productId = params.id;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const accessToken = getCookie('access_token');
        if (accessToken !== null) {
          const product = await fetchWithToken(accessToken);
          if (product) {
            setProduct(product);
          }
        } else {
          console.log('No access token available');
          handleInvalidToken();
        }
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
      }
    };

    const fetchWithToken = async (token: string) => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/product/${productId}`, {
          headers: {
            'Authorization': 'Bearer ' + token,
          },
          validateStatus: () => true,
        });

        if (response.status === 200) {
          return response.data;
        } else if (response.status === 401) {
          console.log('Access token expired, refreshing...');
          const newAccessToken = await getNewAccessToken();
          if (newAccessToken) {
            return await fetchWithToken(newAccessToken);
          } else {
            console.log('Refresh token invalid, redirecting to login...');
            handleInvalidToken();
          }
        } else {
          console.log(`Unexpected response status: ${response.status}`);
          return null;
        }
      } catch (error) {
        console.error('Error: ', error);
        return null;
      }
    };

    const handleInvalidToken = () => {
      router.dismissAll();
      router.replace('/(tabs)/');
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    // Function to add the product to the cart
    console.log(`Added ${quantity} item(s) to the cart`);
  };

  const handleBuyNow = () => {
    // Function to handle immediate purchase
    console.log(`Bought ${quantity} item(s)`);
  };

  const incrementQuantity = () => {
    if (product?.stock !== undefined && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (!product) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: 'http://127.0.0.1:8000' + product.image }} style={styles.productImage} />
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productDescription}>{product.description}</Text>
      <Text style={styles.productPrice}>R$ {product.price.toFixed(2)}</Text>

      <View style={styles.quantityContainer}>
        <Text style={styles.label}>Quantidade:</Text>
        <View style={styles.quantityButtonsContainer}>
          <TouchableOpacity style={styles.quantityButton} onPress={decrementQuantity}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity style={styles.quantityButton} onPress={incrementQuantity}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.stockInfo}>Em estoque: {product.stock}</Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
          <Text style={styles.buttonText}>Adicionar ao Carrinho</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleBuyNow}>
          <Text style={styles.buttonText}>Comprar Agora</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
  },
  productImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2a9d8f',
    marginBottom: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginRight: 8,
  },
  quantityButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: '#2a9d8f',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'center',
  },
  stockInfo: {
    fontSize: 16,
    color: '#555',
    marginBottom: 24,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#2a9d8f',
    paddingVertical: 12,
    marginVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },

});

export default ViewProduct;
