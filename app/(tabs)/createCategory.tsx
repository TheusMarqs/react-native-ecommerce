import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { getCookie } from '../../services/CookieService';
import { router, useLocalSearchParams } from 'expo-router';
import AwesomeAlert from 'react-native-awesome-alerts';

const createCategory: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error'>('error');
    const { id } = useLocalSearchParams<{ id?: string }>();

    useEffect(() => {
        if (id) {
            fetchCategoryDetails(id);
        }
    }, [id]);

    const fetchCategoryDetails = async (categoryId: string) => {
        try {
            const token = await getCookie('access_token');
            const response = await axios.get(`https://backend-pm.onrender.com/category/${categoryId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) {
                setName(response.data.name);
                setDescription(response.data.description);
            } else {
                setAlertMessage('Erro ao carregar detalhes da categoria.');
                setAlertType('error');
                setShowAlert(true);
            }
        } catch (error) {
            console.error('Erro ao carregar detalhes da categoria:', error);
            setAlertMessage('Erro ao carregar detalhes da categoria.');
            setAlertType('error');
            setShowAlert(true);
        }
    };

    const handleSave = async () => {
        if (!name || !description) {
            setAlertMessage('Por favor, preencha todos os campos.');
            setAlertType('error');
            setShowAlert(true);
            return;
        }
        setLoading(true);
        try {
            const token = await getCookie('access_token');
            const url = id
                ? `https://backend-pm.onrender.com/category/update/${id}`
                : 'https://backend-pm.onrender.com/category/create';
            const method = id ? 'put' : 'post';

            const response = await axios({
                method,
                url,
                data: { name, description },
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200 || response.status === 201) {
                setAlertMessage(id ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!');
                setAlertType('success');
                setShowAlert(true);
                if (!id) {
                    setName('');
                    setDescription('');
                }
            } else {
                setAlertMessage('Erro ao salvar categoria.');
                setAlertType('error');
                setShowAlert(true);
            }
        } catch (error) {
            console.error('Erro ao salvar categoria:', error);
            setAlertMessage('Erro ao salvar categoria.');
            setAlertType('error');
            setShowAlert(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>{id ? 'Editar Categoria' : 'Criar Categoria'}</Text>
            <TextInput
                style={styles.input}
                placeholder="Nome"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#aaa"
            />
            <TextInput
                style={styles.input}
                placeholder="Descrição"
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="#aaa"
            />
            <TouchableOpacity onPress={handleSave} style={styles.button}>
                <Text style={styles.buttonText}>{loading ? 'Carregando...' : id ? 'Atualizar Categoria' : 'Salvar Categoria'}</Text>
            </TouchableOpacity>
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
                onConfirmPressed={() => {
                    setShowAlert(false);
                    if (alertType === 'success') router.replace('/(tabs)/listCategory');
                }}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f4f4f4' },
    header: { marginTop: 30, fontSize: 24, fontWeight: 'bold', marginBottom: 40, textAlign: 'center' },
    input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, fontSize: 16, marginBottom: 20 },
    button: { backgroundColor: '#007b5e', padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
    buttonText: { color: '#fff', fontSize: 18 },
});

export default createCategory;
