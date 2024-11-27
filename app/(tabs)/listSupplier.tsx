import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import { Link, router } from 'expo-router';
import AwesomeAlert from 'react-native-awesome-alerts';
import { getCookie } from '../../services/CookieService';
import { getNewAccessToken } from '../../services/TokenService';

const ListSupplier: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error'>('success');
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

    // Fetch suppliers
    const fetchSuppliers = async () => {
        try {
            const accessToken = await getCookie('access_token');
            if (accessToken !== null) {
                const suppliers = await fetchWithToken(accessToken);
                if (suppliers) {
                    setSuppliers(suppliers);
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
            const response = await axios.get('https://backend-pm.onrender.com/supplier/', {
                headers: {
                    'Authorization': 'Bearer ' + token,
                },
                validateStatus: () => true,
            });

            if (response.status === 200) {
                console.log('Suppliers received');
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

    // Delete supplier
    const confirmDeleteSupplier = (id: number) => {
        setAlertMessage('Tem certeza que deseja excluir este fornecedor?');
        setAlertType('error');
        setShowAlert(true);
        setConfirmAction(() => async () => {
            try {
                const accessToken = await getCookie('access_token');
                await axios.delete(`https://backend-pm.onrender.com/supplier/delete/${id}`,
                    {
                        headers: {
                            'Authorization': 'Bearer ' + accessToken,
                        },
                        validateStatus: () => true,
                    }
                );
                setAlertMessage('Fornecedor excluído com sucesso.');
                setAlertType('success');
                setShowAlert(true);
                fetchSuppliers();
            } catch (error) {
                setAlertMessage('Não foi possível excluir o fornecedor.');
                setAlertType('error');
                setShowAlert(true);
                console.error(error);
            }
        });
    };

    // Navigate to edit supplier
    const editSupplier = (id: number) => {
        router.dismissAll();
        router.replace(`/createSupplier?id=${id}`);
    };

    const getAccess = async () => {
        let superUser = await getCookie('is_superuser');

        if (superUser == 'false') {
            router.dismissAll();
            router.replace('/(tabs)/listProduct');
        }
    }

    useEffect(() => {
        getAccess();
        fetchSuppliers();
    }, []);

    const renderSupplier = ({ item }: { item: Supplier }) => (
        <View style={styles.supplierCard}>
            <Text style={styles.supplierName}>{item.name}</Text>
            <Text style={styles.supplierDetail}>Email: {item.email}</Text>
            <Text style={styles.supplierDetail}>Telefone: {item.phone}</Text>
            <Text style={styles.supplierDetail}>Categoria: {item.category}</Text>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.button, styles.editButton]}
                    onPress={() => editSupplier(item.id)}
                >
                    <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.deleteButton]}
                    onPress={() => confirmDeleteSupplier(item.id)}
                >
                    <Text style={styles.buttonText}>Excluir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Fornecedores</Text>
            <Link style={styles.newSupplierBtn} href="/(tabs)/createSupplier">
                <Text style={styles.buttonText}>Novo fornecedor</Text>
            </Link>
            {loading ? (
                <ActivityIndicator size="large" color="#007b5e" />
            ) : (
                <FlatList
                    data={suppliers}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderSupplier}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={styles.emptyMessage}>Nenhum fornecedor encontrado.</Text>
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
    supplierCard: {
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
    supplierName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    supplierDetail: {
        fontSize: 14,
        color: '#555',
        marginBottom: 5,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    editButton: {
        backgroundColor: '#4CAF50',
    },
    deleteButton: {
        backgroundColor: '#F44336',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#555',
        marginTop: 50,
        fontSize: 16,
    },
    newSupplierBtn: {
        padding: 11,
        backgroundColor: '#007b5e',
        borderRadius: 5,
        alignItems: 'center',
        width: 140,
        marginBottom: 10,
    },
});

export default ListSupplier;
