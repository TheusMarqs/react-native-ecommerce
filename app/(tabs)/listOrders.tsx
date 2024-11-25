import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Link, router, useLocalSearchParams } from 'expo-router';
import AwesomeAlert from 'react-native-awesome-alerts';
import { getCookie } from '../../services/CookieService';
import { getNewAccessToken } from '../../services/TokenService';
import { Order, OrderItem } from '@/interfaces/Order';

const ListOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isSuperUser, setIsSuperUser] = useState<string | null>(null);
    const [alertType, setAlertType] = useState<'success' | 'error'>('success');
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

    const params = useLocalSearchParams();
    const clientId = Number(params.id);

    const getAccess = async () => {
        let superUser = await getCookie('is_superuser');
        if (!clientId && superUser == 'false') {
            router.dismissAll();
            router.replace('/(tabs)/listProduct')
        }
        setIsSuperUser(superUser);
    }

    // Fetch orders
    const fetchOrders = async () => {
        try {
            const accessToken = getCookie('access_token');
            if (accessToken !== null) {
                const orders = await fetchWithToken(accessToken);
                if (orders) {
                    setAccessToken(accessToken);
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
        let url;
        if (clientId) {
            url = `http://127.0.0.1:8000/order/client/${clientId}`;
        }
        else {
            url = 'http://127.0.0.1:8000/order/';
        }
        try {
            const response = await axios.get(url, {
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
                    setAccessToken(newAccessToken);
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
        getAccess();
        fetchOrders();
    }, []);

    const renderOrderItem = (orderItem: OrderItem) => (
        <Text style={styles.orderDetail}>
            {orderItem.quantity} x {orderItem.product.name} - R$ {Number(orderItem.product.price).toFixed(2)}
        </Text>
    );

    const confirmDeleteOrder = (id: number) => {
        setAlertMessage('Tem certeza que deseja excluir este pedido?');
        setAlertType('error');
        setShowAlert(true);
        setConfirmAction(() => async () => {
            try {
                var response = await axios.delete(`http://127.0.0.1:8000/order/delete/${id}`,
                    {
                        headers: {
                            'Authorization': 'Bearer ' + accessToken,
                        },
                        validateStatus: () => true,
                    }
                );

                console.log(response);
                setAlertMessage('Pedido excluído com sucesso.');
                setAlertType('success');
                setShowAlert(true);
                fetchOrders();
            } catch (error) {
                setAlertMessage('Não foi possível excluir o pedido.');
                setAlertType('error');
                setShowAlert(true);
                console.error(error);
            }
        });
    };

    const renderOrder = ({ item }: { item: Order }) => (
        <View style={styles.orderCard}>
            {clientId ? (
                <Text style={styles.orderTitle}>Pedido</Text>
            ) : <Text style={styles.orderTitle}>Pedido #{item.id}</Text>
            }
            {clientId ? (
                null
            ) : <Text style={styles.orderDetail}>Cliente ID: {item.client}</Text>
            }
            <Text style={styles.orderDetail}>Data: {new Date(item.date).toLocaleString()}</Text>
            <Text style={styles.orderDetail}>Total: R$ {Number(item.total).toFixed(2)}</Text>
            <Text style={styles.orderSubtitle}>Itens:</Text>
            {item.order_items.map(renderOrderItem)}

            {!clientId && isSuperUser == 'true' ? (
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => confirmDeleteOrder(item.id)}
                >
                    <Text style={styles.buttonText}>Excluir</Text>
                </TouchableOpacity>
            ) : null}

        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Pedidos</Text>
            {/* <Link style={styles.newOrderBtn} href="/(tabs)/createOrder">
                <Text style={styles.buttonText}>Novo Pedido</Text>
            </Link> */}
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
    deleteButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
        backgroundColor: '#F44336',
    }
});

export default ListOrders;
