import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import { Link, router } from 'expo-router';
import AwesomeAlert from 'react-native-awesome-alerts';
import { getCookie } from '../services/CookieService';
import { getNewAccessToken } from '../services/TokenService';
import { Order, OrderItem } from '@/interfaces/Order';

const ListOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    // Fetch orders
    const fetchOrders = async () => {
        try {
            const accessToken = getCookie('access_token');
            if (accessToken !== null) {
                const orders = await fetchWithToken(accessToken);
                if (orders) {
                    setOrders(orders);
                }
            } else {
                console.log('No access token available');
                handleInvalidToken();
            }
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
        }
    };

    const fetchWithToken = async (token: string) => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/order/', {
                headers: {
                    'Authorization': 'Bearer ' + token,
                },
                validateStatus: () => true,
            });

            if (response.status === 200) {
                console.log('Orders received');
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
            console.error('Erro na requisição:', error);
            return null;
        }
    };

    const handleInvalidToken = () => {
        router.dismissAll();
        router.replace('/(tabs)/');
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const renderOrderItem = (orderItem: OrderItem) => (
        <Text style={styles.orderDetail}>
            {orderItem.quantity} x {orderItem.product.name} - R$ {Number(orderItem.product.price).toFixed(2)}
        </Text>
    );

    const renderOrder = ({ item }: { item: Order }) => (
        <View style={styles.orderCard}>
            <Text style={styles.orderTitle}>Pedido #{item.id}</Text>
            <Text style={styles.orderDetail}>Cliente ID: {item.client}</Text>
            <Text style={styles.orderDetail}>Data: {new Date(item.date).toLocaleString()}</Text>
            <Text style={styles.orderDetail}>Total: R$ {Number(item.total).toFixed(2)}</Text>
            <Text style={styles.orderSubtitle}>Itens:</Text>
            {item.order_items.map(renderOrderItem)}
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Pedidos</Text>
            <Link style={styles.newOrderBtn} href="/(tabs)/createOrder">
                <Text style={styles.buttonText}>Novo Pedido</Text>
            </Link>
            {loading ? (
                <ActivityIndicator size="large" color="#007b5e" />
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderOrder}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={styles.emptyMessage}>Nenhum pedido encontrado.</Text>
                    }
                />
            )}

            <AwesomeAlert
                show={showAlert}
                title="Erro!"
                message={alertMessage}
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={false}
                showConfirmButton={true}
                confirmText="OK"
                confirmButtonColor="#F44336"
                onConfirmPressed={() => setShowAlert(false)}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f4',
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: 'black',
    },
    list: {
        paddingBottom: 20,
    },
    orderCard: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    orderSubtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
        marginTop: 10,
    },
    orderDetail: {
        fontSize: 14,
        color: '#555',
        marginBottom: 5,
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#555',
        marginTop: 50,
        fontSize: 16,
    },
    newOrderBtn: {
        padding: 11,
        backgroundColor: '#007b5e',
        borderRadius: 5,
        alignItems: 'center',
        width: 140,
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default ListOrders;
