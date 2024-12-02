import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Link, router } from 'expo-router';
import AwesomeAlert from 'react-native-awesome-alerts';
import { getCookie } from '../../services/CookieService';
import { Category } from '@/interfaces/Category';

const ListCategory: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error'>('success');

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const token = await getCookie('access_token');
            if (token) {
                const response = await axios.get('https://backend-pm.onrender.com/category/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.status === 200) {
                    setCategories(response.data);
                } else {
                    setAlertMessage('Erro ao buscar categorias.');
                    setAlertType('error');
                    setShowAlert(true);
                }
            }
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDeleteCategory = async (id: string) => {
        setLoading(true);
        try {
            const token = await getCookie('access_token');
            const response = await axios.delete(`https://backend-pm.onrender.com/category/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 204) {
                setAlertMessage('Categoria excluída com sucesso!');
                setAlertType('success');
                setCategories((prev) => prev.filter((cat) => cat.id !== id));
            } else {
                setAlertMessage('Erro ao excluir categoria.');
                setAlertType('error');
            }
        } catch (error) {
            console.error('Erro ao excluir categoria:', error);
            setAlertMessage('Erro ao excluir categoria.');
            setAlertType('error');
        } finally {
            setShowAlert(true);
            setLoading(false);
        }
    };

    const renderCategory = ({ item }: { item: Category }) => (
        <View style={styles.categoryCard}>
            <View>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryDescription}>{item.description}</Text>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => router.push({ pathname: '/(tabs)/createCategory', params: { id: item.id } })}
                >
                    <Text style={styles.actionText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteCategory(item.id)}>
                    <Text style={styles.actionText}>Excluir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Categorias</Text>
            <Link style={styles.newCategoryBtn} href="/(tabs)/createCategory">
                <Text style={styles.buttonText}>Nova categoria</Text>
            </Link>
            {loading ? (
                <ActivityIndicator size="large" color="#007b5e" />
            ) : (
                <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCategory}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.emptyMessage}>Nenhuma categoria encontrada.</Text>}
                />
            )}
            <AwesomeAlert
                show={showAlert}
                title={alertType === 'success' ? 'Sucesso!' : 'Erro!'}
                message={alertMessage}
                closeOnTouchOutside={true}
                closeOnHardwareBackPress={false}
                showCancelButton={false}
                showConfirmButton={true}
                confirmText="OK"
                confirmButtonColor={alertType === 'success' ? '#4CAF50' : '#F44336'}
                onConfirmPressed={() => setShowAlert(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f4f4f4' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    list: { paddingBottom: 20 },
    categoryCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: '#fff',
        marginBottom: 10,
        borderRadius: 8,
    },
    categoryName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    categoryDescription: { fontSize: 14, color: '#555', marginTop: 5 },
    newCategoryBtn: { padding: 10, backgroundColor: '#007b5e', borderRadius: 5, alignItems: 'center', marginBottom: 10 },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    actionButtons: { flexDirection: 'row' },
    editButton: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, marginRight: 5 },
    deleteButton: { backgroundColor: '#F44336', padding: 10, borderRadius: 5 },
    actionText: { color: '#fff', fontWeight: 'bold' },
    emptyMessage: { textAlign: 'center', color: '#555', fontSize: 16, marginTop: 50 },
});

export default ListCategory;
