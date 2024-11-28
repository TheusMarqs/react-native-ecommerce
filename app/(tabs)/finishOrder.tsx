import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import RNPickerSelect from 'react-native-picker-select';
import AwesomeAlert from 'react-native-awesome-alerts';

interface FormData {
    cep: string;
    city: string;
    street: string;
    number: string;
    complement: string;
    paymentMethod: string;
}

const FinishOrder: React.FC = () => {
    const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [isLoading, setIsLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    const onSubmit = (data: FormData) => {
        setIsLoading(true);
        // Simular envio do pedido
        setTimeout(() => {
            setIsLoading(false);
            setShowAlert(true);  // Exibir o alerta
        }, 1000);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Informações de Entrega e Pagamento</Text>

                {/* CEP */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>CEP:</Text>
                    <Controller
                        name="cep"
                        control={control}
                        rules={{ required: 'CEP é obrigatório', pattern: { value: /^[0-9]{5}-?[0-9]{3}$/, message: 'Formato de CEP inválido' } }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={[styles.input, errors.cep && styles.errorInput]}
                                value={value}
                                onChangeText={onChange}
                                placeholder="Digite o CEP"
                                keyboardType="numeric"
                                placeholderTextColor="#aaa"
                            />
                        )}
                    />
                    {errors.cep && <Text style={styles.errorText}>{errors.cep.message}</Text>}
                </View>

                {/* Rua */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Rua:</Text>
                    <Controller
                        name="street"
                        control={control}
                        rules={{ required: 'Rua é obrigatória' }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={[styles.input, errors.street && styles.errorInput]}
                                value={value}
                                onChangeText={onChange}
                                placeholder="Digite o nome da rua"
                                placeholderTextColor="#aaa"
                            />
                        )}
                    />
                    {errors.street && <Text style={styles.errorText}>{errors.street.message}</Text>}
                </View>

                {/* Número */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Número:</Text>
                    <Controller
                        name="number"
                        control={control}
                        rules={{ required: 'Número é obrigatório' }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={[styles.input, errors.number && styles.errorInput]}
                                value={value}
                                onChangeText={onChange}
                                placeholder="Digite o número"
                                keyboardType="numeric"
                                placeholderTextColor="#aaa"
                            />
                        )}
                    />
                    {errors.number && <Text style={styles.errorText}>{errors.number.message}</Text>}
                </View>

                {/* Complemento */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Complemento:</Text>
                    <Controller
                        name="complement"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={styles.input}
                                value={value}
                                onChangeText={onChange}
                                placeholder="Ex: Apartamento, Bloco, etc."
                                placeholderTextColor="#aaa"
                            />
                        )}
                    />
                </View>

                {/* Cidade */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Cidade:</Text>
                    <Controller
                        name="city"
                        control={control}
                        rules={{ required: 'Cidade é obrigatória' }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={[styles.input, errors.city && styles.errorInput]}
                                value={value}
                                onChangeText={onChange}
                                placeholder="Digite o nome da cidade"
                                placeholderTextColor="#aaa"
                            />
                        )}
                    />
                    {errors.city && <Text style={styles.errorText}>{errors.city.message}</Text>}
                </View>

                {/* Método de Pagamento */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Método de Pagamento:</Text>
                    <Controller
                        name="paymentMethod"
                        control={control}
                        rules={{ required: 'Método de pagamento é obrigatório' }}
                        render={({ field: { onChange, value } }) => (
                            <RNPickerSelect
                                onValueChange={onChange}
                                value={value}
                                items={[
                                    { label: 'Cartão de Crédito', value: 'credit_card' },
                                    { label: 'Boleto Bancário', value: 'boleto' },
                                    { label: 'PayPal', value: 'paypal' },
                                ]}
                                placeholder={{ label: 'Selecione um método', value: null }}
                            />
                        )}
                    />
                    {errors.paymentMethod && <Text style={styles.errorText}>{errors.paymentMethod.message}</Text>}
                </View>

                {/* Botão de Submissão */}
                {/* <View style={styles.buttonContainer}>
                    <Button
                        title={isLoading ? 'Finalizando...' : 'Finalizar Pedido'}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isLoading}
                    />
                </View> */}
                <TouchableOpacity onPress={handleSubmit(onSubmit)} style={styles.button}>
                    <Text style={styles.buttonText}>{isLoading ? 'Carregando...' : 'Finalizar pedido'}</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Alerta */}
            <AwesomeAlert
                show={showAlert}
                title="Pedido Finalizado"
                message="Seu pedido foi realizado com sucesso!"
                closeOnTouchOutside={false}
                showCancelButton={false}
                showConfirmButton={true}
                confirmText="Ok"
                confirmButtonColor="#3d85c6"
                onConfirmPressed={() => setShowAlert(false)}
            />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    errorInput: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
    },
    buttonContainer: {
        marginTop: 20,
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

export default FinishOrder;
