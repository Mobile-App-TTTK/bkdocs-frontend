import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Box, Button, FormControl, Pressable, Text, VStack } from "native-base";
import React, { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from "react-native";

interface NewPasswordFormProps {
    onSubmit: (password: string) => void;
    isLoading?: boolean;
}

export default function NewPasswordForm({ onSubmit, isLoading = false }: NewPasswordFormProps) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

    const router = useRouter();
    const passwordRef = useRef<TextInput>(null);
    const confirmPasswordRef = useRef<TextInput>(null);

    const validateForm = () => {
        const newErrors: { password?: string; confirmPassword?: string } = {};

        if (!password.trim()) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = 'Xin hãy xác nhận mật khẩu';
        } else if (confirmPassword !== password) {
            newErrors.confirmPassword = 'Nhập lại mật khẩu không khớp';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit(password);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Box px={6} flex={1} py={8} justifyContent="center">
                    <Pressable 
                        className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mt-10" 
                        onPress={() => router.back()}
                    >
                        <Ionicons name="chevron-back-outline" size={20} color={"#888888"} style={{marginLeft: -2}}/>
                    </Pressable>

                    <VStack space={6}>
                        <VStack alignItems="center" space={1}>
                            <Text className='!text-3xl !font-bold !text-primary-500 mt-20'>Đặt mật khẩu mới</Text>
                            <Text className='dark:text-gray-50 text-gray-800'>Vui lòng nhập mật khẩu mới của bạn</Text>
                        </VStack>

                        <FormControl isInvalid={!!errors.password}>
                            <FormControl.Label>Mật khẩu mới</FormControl.Label>
                            <View style={{
                                height: 48,
                                borderRadius: 12,
                                borderWidth: errors.password ? 2 : 1,
                                borderColor: errors.password ? '#ef4444' : '#d1d5db',
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 12,
                                backgroundColor: '#ffffff',
                                marginTop: 4
                            }}>
                                <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={{ marginRight: 8 }} />
                                <TextInput
                                    ref={passwordRef}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Nhập mật khẩu mới"
                                    placeholderTextColor="#9ca3af"
                                    autoCapitalize="none"
                                    secureTextEntry={!showPassword}
                                    editable={!isLoading}
                                    returnKeyType="next"
                                    blurOnSubmit={false}
                                    enablesReturnKeyAutomatically={true}
                                    onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                                    style={{
                                        flex: 1,
                                        fontSize: 16,
                                        color: '#000000',
                                        fontFamily: 'Inter-Regular',
                                        height: '100%',
                                    }}
                                />
                                <TouchableOpacity 
                                    onPress={() => setShowPassword(!showPassword)} 
                                    disabled={isLoading}
                                    style={{ padding: 4 }}
                                >
                                    <Ionicons 
                                        name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                                        size={20} 
                                        color="#6b7280" 
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.password && (
                                <FormControl.ErrorMessage>{errors.password}</FormControl.ErrorMessage>
                            )}
                        </FormControl>

                        <FormControl isInvalid={!!errors.confirmPassword}>
                            <FormControl.Label>Xác nhận mật khẩu</FormControl.Label>
                            <View style={{
                                height: 48,
                                borderRadius: 12,
                                borderWidth: errors.confirmPassword ? 2 : 1,
                                borderColor: errors.confirmPassword ? '#ef4444' : '#d1d5db',
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 12,
                                backgroundColor: '#ffffff',
                                marginTop: 4
                            }}>
                                <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={{ marginRight: 8 }} />
                                <TextInput
                                    ref={confirmPasswordRef}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Nhập lại mật khẩu mới"
                                    placeholderTextColor="#9ca3af"
                                    autoCapitalize="none"
                                    secureTextEntry={!showConfirmPassword}
                                    editable={!isLoading}
                                    returnKeyType="done"
                                    enablesReturnKeyAutomatically={true}
                                    onSubmitEditing={handleSubmit}
                                    style={{
                                        flex: 1,
                                        fontSize: 16,
                                        color: '#000000',
                                        fontFamily: 'Inter-Regular',
                                        height: '100%'
                                    }}
                                />
                                <TouchableOpacity 
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                                    disabled={isLoading}
                                    style={{ padding: 4 }}
                                >
                                    <Ionicons 
                                        name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} 
                                        size={20} 
                                        color="#6b7280" 
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.confirmPassword && (
                                <FormControl.ErrorMessage>{errors.confirmPassword}</FormControl.ErrorMessage>
                            )}
                        </FormControl>

                        <Button 
                            onPress={handleSubmit} 
                            isDisabled={isLoading} 
                            isLoading={isLoading} 
                            borderRadius={12} 
                            height={12}
                        >
                            Xác nhận
                        </Button>
                    </VStack>
                </Box>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}