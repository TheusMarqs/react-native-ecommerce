import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import { getCookie } from '../services/CookieService';
import { getNewAccessToken } from '../services/TokenService';
import { router, useLocalSearchParams } from 'expo-router';
import AwesomeAlert from 'react-native-awesome-alerts';

const CreateSupplier: React.FC = () => {
    const params = useLocalSearchParams();
    const supplierId = params.id;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [category, setCategory] = useState<string>('');
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error'>('error');

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    useEffect(() => {
        const token = getCookie('access_token');

        const fetchCategories = async () => {
            try {
                if (token !== null) {
                    const categories = await fetchWithToken(token);
                    if (categories) {
                        setCategories(categories);
                        setAccessToken(token);
                    }
                } else {
                    console.log('No access token available');
                    handleInvalidToken();
                }
            } catch (error) {
                console.error('Erro ao buscar categorias:', error);
                displayAlert('Erro ao buscar categorias.', 'error');
            }
        };

        const fillForm = async () => {
            if (supplierId) {
                try {
                    const response = await axios.get(`http://127.0.0.1:8000/supplier/${supplierId}`, {
                        headers: {
                            Authorization: 'Bearer ' + token,
                        },
                        validateStatus: () => true,
                    });

                    if (response.status === 200) {
                        const data = response.data;
                        setName(data.name || '');
                        setEmail(data.email || '');
                        setPhone(data.phone || '');
                        setCategory(data.category || '');
                    } else {
                        console.error('Erro ao carregar fornecedor:', response.status);
                        displayAlert('Erro ao carregar fornecedor.', 'error');
                    }
                } catch (error) {
                    console.error('Erro ao carregar fornecedor:', error);
                    displayAlert('Erro ao carregar fornecedor.', 'error');
                }
            } else {
                // Limpa o formulário ao criar um novo fornecedor
                setName('');
                setEmail('');
                setPhone('');
                setCategory('');
            }
        };

        const fetchWithToken = async (token: string) => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/category/', {
                    headers: {
                        Authorization: 'Bearer ' + token,
                    },
                    validateStatus: () => true,
                });

                if (response.status === 200) {
                    console.log('Categories received');
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

        fetchCategories();
        fillForm();
    }, [supplierId]); // Atualiza sempre que o `supplierId` mudar

    const displayAlert = (message: string, type: 'success' | 'error') => {
        setAlertMessage(message);
        setAlertType(type);
        setShowAlert(true);
    };

    const handleSupplier = async () => {
        if (!name || !email || !phone || !category) {
            displayAlert('Por favor, preencha todos os campos.', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            displayAlert('Por favor, insira um email válido.', 'error');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('category', category);

        try {
            let response;
            if (supplierId !== undefined) {
                response = await axios.put(`http://127.0.0.1:8000/supplier/update/${supplierId}`, formData, {
                    headers: {
                        Authorization: 'Bearer ' + accessToken,
                    },
                });
            } else {
                response = await axios.post('http://127.0.0.1:8000/supplier/create', formData, {
                    headers: {
                        Authorization: 'Bearer ' + accessToken,
                    },
                });
            }

            console.log(response.data);
            displayAlert('Fornecedor salvo com sucesso!', 'success');
            setName('');
            setEmail('');
            setPhone('');
            setCategory('');
        } catch (error) {
            console.error('Erro ao salvar fornecedor:', error);
            displayAlert('Erro ao salvar fornecedor.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Cadastrar Fornecedor</Text>

            <TextInput
                style={styles.input}
                placeholder="Nome"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#aaa"
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholderTextColor="#aaa"
            />
            <TextInput
                style={styles.input}
                placeholder="Telefone"
                value={phone}
                keyboardType="decimal-pad"
                onChangeText={(text) => setPhone(text.replace(/[^0-9.]/g, ''))}
                placeholderTextColor="#aaa"
            />

            <View style={styles.pickerContainer}>
                <RNPickerSelect
                    value={category} // Assegure-se de que o valor do estado está sendo aplicado
                    onValueChange={(value) => {
                        setCategory(value); // Atualiza o estado com o valor selecionado
                    }}
                    items={categories.map((cat) => ({
                        label: cat.name,
                        value: cat.id,
                    }))}
                    placeholder={{
                        label: 'Selecione uma categoria',
                        value: '',
                    }} // Valor inicial vazio
                    style={{
                        inputIOS: styles.pickerInput,
                        inputAndroid: styles.pickerInput,
                    }}
                />

            </View>

            <TouchableOpacity onPress={handleSupplier} style={styles.button}>
                <Text style={styles.buttonText}>{loading ? 'Carregando...' : 'Salvar fornecedor'}</Text>
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
                    router.dismissAll();
                    router.replace('/(tabs)/listProduct');
                }}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f4f4f4',
    },
    header: {
        marginTop: 30,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 40,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 20,
    },
    pickerContainer: {
        marginBottom: 20,
    },
    pickerInput: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    button: {
        backgroundColor: '#007b5e',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
});

export default CreateSupplier;
