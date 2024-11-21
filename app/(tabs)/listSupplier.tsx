import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import { Link, router } from 'expo-router';
import AwesomeAlert from 'react-native-awesome-alerts';

const ListSupplier: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error'>('success');
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

    // Fetch suppliers
    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:8000/supplier/');
            setSuppliers(response.data);
        } catch (error) {
            setAlertMessage('Não foi possível carregar os fornecedores.');
            setAlertType('error');
            setShowAlert(true);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Delete supplier
    const confirmDeleteSupplier = (id: number) => {
        setAlertMessage('Tem certeza que deseja excluir este fornecedor?');
        setAlertType('error');
        setShowAlert(true);
        setConfirmAction(() => async () => {
            try {
                await axios.delete(`http://127.0.0.1:8000/supplier/delete/${id}`);
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

    useEffect(() => {
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
