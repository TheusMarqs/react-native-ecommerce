import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';

const CreateProduct: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [barCode, setBarCode] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [category, setCategory] = useState<string>(''); // Inicializando como string
    const [categories, setCategories] = useState<any[]>([]); // Estado para armazenar as categorias
    const [image, setImage] = useState<any>(null); // Imagem do produto
    const [loading, setLoading] = useState(false);

    // Função para buscar categorias ao carregar o componente
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/category', {
                    headers: {
                        'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMxODE3MjUxLCJpYXQiOjE3MzE4MTM2NTEsImp0aSI6ImJmODMzZmE0NWQ1MTRjZDFhODBlYWU2Yzk2MTVjYTljIiwidXNlcl9pZCI6MX0.NfkMGRi_Fv1Xig9euPbfUUoEWYDnXmsv30BziiyqCHk'
                    }
                });
                setCategories(response.data);
            } catch (error) {
                console.error('Erro ao buscar categorias:', error);
                Alert.alert('Erro', 'Erro ao buscar categorias');
            }
        };

        fetchCategories();
    }, []);

    // Função para validar e atualizar o campo de preço (aceita apenas números e ponto)
    const handlePriceChange = (text: string) => {
        const formattedText = text.replace(/[^0-9.]/g, '');
        const parts = formattedText.split('.');
        if (parts.length > 2) {
            return;
        }
        setPrice(formattedText);
    };

    // Função para validar e atualizar o campo de estoque (aceita apenas números inteiros)
    const handleStockChange = (text: string) => {
        const formattedText = text.replace(/[^0-9]/g, '');
        setStock(formattedText);
    };

    // Função para criar um produto
    const handleCreateProduct = async () => {
        if (!name || !description || !price || !stock || !barCode || !qrCode || !category) {
            Alert.alert('Erro', 'Preencha todos os campos');
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

        if (image) {
            formData.append('image', {
                uri: image.uri,
                type: image.type,
                name: image.fileName,
            });
        }

        try {
            const response = await axios.post('http://127.0.0.1:8000/product/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMxODE3MjUxLCJpYXQiOjE3MzE4MTM2NTEsImp0aSI6ImJmODMzZmE0NWQ1MTRjZDFhODBlYWU2Yzk2MTVjYTljIiwidXNlcl9pZCI6MX0.NfkMGRi_Fv1Xig9euPbfUUoEWYDnXmsv30BziiyqCHk',
                },
            });

            console.log(response.data);

            Alert.alert('Sucesso', 'Produto criado com sucesso');
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
            Alert.alert('Erro', 'Erro ao criar produto');
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
                onChangeText={handlePriceChange}
                placeholderTextColor="#aaa"
            />
            <TextInput
                style={styles.input}
                placeholder="Estoque"
                value={stock}
                keyboardType="numeric"
                onChangeText={handleStockChange}
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

            {/* Seleção de Categoria com o Picker customizado */}
            <View style={styles.pickerContainer}>
                <RNPickerSelect
                    onValueChange={(value) => setCategory(value)}
                    items={categories.map((cat: any) => ({
                        label: cat.name,  // Certifique-se de que cat.name seja uma string
                        value: cat.id,    // Certifique-se de que cat.id seja uma string ou número
                    }))}
                    placeholder={{
                        label: "Selecione uma categoria",
                        value: null,  // Certifique-se de que o valor seja nulo ou algo válido
                    }}
                    style={{
                        inputIOS: styles.pickerInput,
                        inputAndroid: styles.pickerInput,
                        placeholder: styles.placeholder,
                    }}
                />
            </View>

            {/* Adicionando o campo de imagem */}
            <TouchableOpacity onPress={() => {/* lógica para escolher imagem */ }} style={styles.button}>
                <Text style={styles.buttonText}>Escolher Imagem</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleCreateProduct} style={styles.button}>
                <Text style={styles.buttonText}>{loading ? 'Carregando...' : 'Criar Produto'}</Text>
            </TouchableOpacity>
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
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 8,
        fontSize: 16,
        color: '#333',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    pickerContainer: {
        marginBottom: 20,
    },
    pickerInput: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        color: '#333',
        backgroundColor: '#fff',
    },
    placeholder: {
        color: '#aaa',
    },
    button: {
        backgroundColor: '#007b5e',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    }
});

export default CreateProduct;
