import { ROUTES } from '@/constants/routes';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  Box,
  Button,
  FormControl,
  HStack,
  Pressable,
  Text,
  VStack
} from 'native-base';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading?: boolean;
}

export default function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!password.trim()) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(email.trim(), password);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Box px={6} py={8} flex={1} justifyContent="center">
          <VStack space={6}>
            <VStack alignItems="center" space={1}>
              <Text className='!text-3xl !font-bold !text-primary-500'>Đăng nhập</Text>
              <Text className='dark:text-gray-50 text-gray-800'>Vui lòng đăng nhập để sử dụng!</Text>
            </VStack>

            <FormControl isInvalid={!!errors.email}>
              <FormControl.Label>Email</FormControl.Label>
              <View style={{
                height: 48,
                borderRadius: 12,
                borderWidth: errors.email ? 2 : 1,
                borderColor: errors.email ? '#ef4444' : '#d1d5db',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                backgroundColor: '#ffffff',
                marginTop: 4
              }}>
                <Ionicons name="mail-outline" size={20} color="#6b7280" style={{ marginRight: 8 }} />
                <TextInput
                  ref={emailRef}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Nhập email của bạn"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isLoading}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  enablesReturnKeyAutomatically={true}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: '#000000',
                    fontFamily: 'Gilroy-Regular'
                  }}
                />
              </View>
              {errors.email && (
                <FormControl.ErrorMessage>{errors.email}</FormControl.ErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormControl.Label>Mật khẩu</FormControl.Label>
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
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  returnKeyType="done"
                  enablesReturnKeyAutomatically={true}
                  onSubmitEditing={handleSubmit}
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: '#000000',
                    fontFamily: 'Gilroy-Regular'
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

            <Pressable alignSelf="flex-end" isDisabled={isLoading}>
              <Text color="primary.600" fontWeight="medium" onPress={() => router.push(ROUTES.FORGOT_PASSWORD )as any}>Quên mật khẩu?</Text>
            </Pressable>

            <Button onPress={handleSubmit} isDisabled={isLoading} isLoading={isLoading} borderRadius={12} height={12}>
              Đăng nhập
            </Button>

            <HStack justifyContent="center" alignItems="center">
              <Text color="coolGray.600">Chưa có tài khoản? </Text>
              <Pressable isDisabled={isLoading}>
                <Text color="primary.600" fontWeight="semibold" onPress={() => router.push(ROUTES.SIGNUP )as any}>Đăng ký ngay</Text>
              </Pressable>
            </HStack>
          </VStack>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}