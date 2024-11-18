import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';

const createProduct: React.FC = () => {
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

    // Buscar categorias
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/category', {
                    headers: {
                        'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMxODkzMjg5LCJpYXQiOjE3MzE4ODk2ODksImp0aSI6IjhhNjdhMDRlZjE0NzRjODE5YzYwYjUyNGZjMmZhODMzIiwidXNlcl9pZCI6MX0.jhGR6ruw7wRFHR0hn9grpTc0Ih4tP-McyA5rONdSWqc',
                    },
                });
                setCategories(response.data);
            } catch (error) {
                console.error('Erro ao buscar categorias:', error);
                Alert.alert('Erro', 'Erro ao buscar categorias');
            }
        };

        fetchCategories();
    }, []);

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

        if (image?.file) {
            formData.append('image', image.file); // Usa o arquivo original para upload
        }

        try {
            const response = await axios.post('http://127.0.0.1:8000/product/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMxODkzMjg5LCJpYXQiOjE3MzE4ODk2ODksImp0aSI6IjhhNjdhMDRlZjE0NzRjODE5YzYwYjUyNGZjMmZhODMzIiwidXNlcl9pZCI6MX0.jhGR6ruw7wRFHR0hn9grpTc0Ih4tP-McyA5rONdSWqc',
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
                    onValueChange={(value) => setCategory(value)}
                    items={categories.map((cat) => ({
                        label: cat.name,
                        value: cat.id,
                    }))}
                    placeholder={{
                        label: 'Selecione uma categoria',
                        value: null,
                    }}
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

            <TouchableOpacity onPress={handleCreateProduct} style={styles.button}>
                <Text style={styles.buttonText}>{loading ? 'Carregando...' : 'Criar Produto'}</Text>
            </TouchableOpacity>
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
