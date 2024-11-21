import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import { getCookie } from '../services/CookieService';
import { getNewAccessToken } from '../services/TokenService';
import { router, useLocalSearchParams } from 'expo-router';
import AwesomeAlert from 'react-native-awesome-alerts';

const createProduct: React.FC = () => {
    const params = useLocalSearchParams();
    const productId = params.id;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [barCode, setBarCode] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [category, setCategory] = useState<string>('');
    const [categories, setCategories] = useState<any[]>([]);
    const [image, setImage] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<'success' | 'error'>('error');

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
                displayAlert('Erro ao buscar categorias', 'error');
            }
        };

        const fillForm = async () => {
            if (productId) {
                try {
                    const response = await axios.get(`http://127.0.0.1:8000/product/${productId}`, {
                        headers: {
                            Authorization: 'Bearer ' + token,
                        },
                        validateStatus: () => true,
                    });

                    if (response.status === 200) {
                        const data = response.data;
                        setName(data.name || '');
                        setDescription(data.description || '');
                        setPrice(data.price || '');
                        setStock(data.stock || '');
                        setQrCode(data.qr_code || '');
                        setBarCode(data.bar_code || '');
                        setCategory(data.category || '');
                    } else {
                        console.error('Erro ao carregar produto:', response.status);
                        displayAlert('Erro ao carregar produto.', 'error');
                    }
                } catch (error) {
                    console.error('Erro ao carregar produto:', error);
                    displayAlert('Erro ao carregar produto.', 'error');
                }
            } else {
                // Limpa o formulário ao criar um novo produto
                setName('');
                setDescription('');
                setPrice('');
                setStock('');
                setQrCode('');
                setBarCode('');
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
    }, [productId]);

    const displayAlert = (message: string, type: 'success' | 'error') => {
        setAlertMessage(message);
        setAlertType(type);
        setShowAlert(true);
    };


    // Manipular o upload da imagem
    const handleChooseImage = async () => {
        if (Platform.OS === 'web') {
            // Lógica específica para web
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (event: any) => {
                const file = event.target.files[0];
                setImage({
                    uri: URL.createObjectURL(file), // Cria um URL temporário
                    type: file.type,
                    name: file.name,
                    file, // Guarda o arquivo real para enviar no backend
                });
            };
            input.click();
        } else {
            // Adicionar lógica para Android/iOS (com react-native-image-picker)
            
            Alert.alert('Atenção', 'Seleção de imagem não está configurada para mobile ainda.');
        }
    };

    const handleProduct = async () => {
        if (!name || !description || !price || !stock || !barCode || !qrCode || !category) {
            displayAlert('Preencha todos os campos', 'error');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('stock', stock);
        formData.append('bar_code', barCode);
        formData.append('qr_code', qrCode);
        formData.append('category', category);

        if (image?.file) {
            formData.append('image', image.file);
        }

        try {

            let response;
            if (productId !== undefined) {
                response = await axios.put(`http://127.0.0.1:8000/product/update/${productId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': 'Bearer ' + accessToken,
                    },
                });
            } else {
                response = await axios.post('http://127.0.0.1:8000/product/create', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': 'Bearer ' + accessToken,
                    },
                });
            }

            console.log(response.data);

            displayAlert('Produto criado com sucesso!', 'success')
            setName('');
            setDescription('');
            setPrice('');
            setStock('');
            setBarCode('');
            setQrCode('');
            setCategory('');
            setImage(null);
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            displayAlert('Erro ao criar produto.', 'error')
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Cadastrar Produto</Text>

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
            <TextInput
                style={styles.input}
                placeholder="Preço"
                value={price}
                keyboardType="decimal-pad"
                onChangeText={(text) => setPrice(text.replace(/[^0-9.]/g, ''))}
                placeholderTextColor="#aaa"
            />
            <TextInput
                style={styles.input}
                placeholder="Estoque"
                value={stock}
                keyboardType="numeric"
                onChangeText={(text) => setStock(text.replace(/[^0-9]/g, ''))}
                placeholderTextColor="#aaa"
            />
            <TextInput
                style={styles.input}
                placeholder="Código de Barras"
                value={barCode}
                onChangeText={setBarCode}
                placeholderTextColor="#aaa"
            />
            <TextInput
                style={styles.input}
                placeholder="QR Code"
                value={qrCode}
                onChangeText={setQrCode}
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

            {/* Botão para selecionar a imagem */}
            <TouchableOpacity onPress={handleChooseImage} style={styles.button}>
                <Text style={styles.buttonText}>
                    {image ? `Imagem Selecionada: ${image.name}` : 'Escolher Imagem'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleProduct} style={styles.button}>
                <Text style={styles.buttonText}>{loading ? 'Carregando...' : 'Salvar Produto'}</Text>
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
    container: { flex: 1, padding: 20, backgroundColor: '#f4f4f4' },
    header: { marginTop: 30, fontSize: 24, fontWeight: 'bold', marginBottom: 40, textAlign: 'center' },
    input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, fontSize: 16, marginBottom: 20 },
    pickerContainer: { marginBottom: 20 },
    pickerInput: { fontSize: 16, paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8 },
    button: { backgroundColor: '#007b5e', padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
    buttonText: { color: '#fff', fontSize: 18 },
});

export default createProduct;
