import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Modal, Image, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import axios from 'axios';
import { getCookie } from '@/services/CookieService';

const QrCodeScanner: React.FC = () => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [data, setData] = useState<string | null>(null);
    const [product, setProduct] = useState<any | null>(null); // Para armazenar os dados do produto
    const [modalVisible, setModalVisible] = useState(false); // Controle de exibição do modal

    useEffect(() => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
        let token = await getCookie('access_token');
        setScanned(true);
        setData(data);
        console.log('type: ' + type)

        try {
            const response = await axios.get("https://backend-pm.onrender.com/product/code", {
                params: {
                    type: 'qr',
                    code: data,
                },
                headers: {
                    'Authorization': 'Bearer ' + token,
                },
            });

            setProduct(response.data.Product); // Salva os dados do produto no estado
            setModalVisible(true); // Exibe o modal com os dados do produto
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            alert('Erro ao buscar informações do produto.');
        }
    };

    if (hasPermission === null) {
        return <Text>Solicitando permissão para usar a câmera...</Text>;
    }
    if (hasPermission === false) {
        return <Text>Permissão para câmera negada.</Text>;
    }

    return (
        <View style={styles.container}>
            <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
                barCodeTypes={['qr', 'ean13', 'ean8', 'upc', 'code128', 'code39', 'interleaved2of5', 'itf14', 'pdf417']}
            />
            {scanned && <Button title="Escanear novamente" onPress={() => setScanned(false)} />}

            {/* Modal para exibir as informações do produto */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {/* Imagem do Produto */}
                        {product?.image ? (
                            <Image source={{ uri: product.image }} style={styles.productImage} />
                        ) : (
                            <Text style={styles.noImage}>Sem imagem disponível</Text>
                        )}

                        {/* Informações do Produto */}
                        <Text style={styles.productName}>{product?.name}</Text>
                        <Text style={styles.productDescription}>{product?.description}</Text>
                        <Text style={styles.productPrice}>Preço: R$ {product?.price}</Text>
                        <Text style={styles.productStock}>Estoque: {product?.stock} unidades</Text>

                        {/* Botão para fechar o modal */}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    result: { marginTop: 20, fontSize: 16, fontWeight: 'bold' },

    // Estilos do Modal
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    productImage: {
        width: 150,
        height: 150,
        borderRadius: 10,
        marginBottom: 15,
    },
    noImage: {
        fontSize: 14,
        color: '#888',
        marginBottom: 15,
    },
    productName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    productDescription: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 10,
    },
    productPrice: {
        fontSize: 18,
        color: '#007BFF',
        marginBottom: 5,
    },
    productStock: {
        fontSize: 16,
        color: '#28A745',
        marginBottom: 20,
    },
    closeButton: {
        backgroundColor: '#FF5733',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default QrCodeScanner;
