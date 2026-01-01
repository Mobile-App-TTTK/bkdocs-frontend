import { ROUTES } from '@/utils/routes';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

interface SignupFormProps {
  onSubmit: (name: string, email: string, password: string) => void;
  isLoading?: boolean;
}

export default function SignupForm({ onSubmit, isLoading = false }: SignupFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const router = useRouter();

  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Tên là bắt buộc';
    }

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
      onSubmit(name.trim(), email.trim(), password);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      enabled={Platform.OS === 'ios'}
    >
      <ScrollView 
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingBottom: Platform.OS === 'android' ? 20 : 0
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Box px={6} py={8} flex={1} justifyContent="center" minHeight="100%">
          <VStack space={6}>
            <VStack alignItems="center" space={1}>
              <Text className='!text-3xl !font-bold !text-primary-500'>Đăng ký</Text>
              <Text className='dark:text-gray-50 text-gray-800'>Vui lòng điền đầy đủ thông tin đăng ký</Text>
            </VStack>

            <FormControl isInvalid={!!errors.name}>
                <FormControl.Label>Tên</FormControl.Label>
                <View style={{
                    height: 48,
                    borderRadius: 12,
                    borderWidth: errors.name ? 2 : 1,
                    borderColor: errors.name ? '#ef4444' : '#d1d5db',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                    backgroundColor: '#ffffff',
                    marginTop: 4,
                }}>
                    <Ionicons name="person-outline" size={20} color="#6b7280" style={{ marginRight: 8 }} />
                    <TextInput 
                        placeholder="Nhập tên của bạn"
                        ref={nameRef}
                        value={name}
                        onChangeText={setName}
                        returnKeyType="next"
                        blurOnSubmit={false}
                        enablesReturnKeyAutomatically={true}
                        placeholderTextColor="#9ca3af"
                        onSubmitEditing={() => emailRef.current?.focus()}
                        editable={!isLoading}
                        style={{
                            flex: 1,
                            fontSize: 16,
                            color: '#000000',
                            fontFamily: 'Gilroy-Regular',
                            height: '100%'
                        }}
                    />
                </View>
            </FormControl>
                



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
                            fontFamily: 'Gilroy-Regular',
                            height: '100%'
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
                    fontFamily: 'Gilroy-Regular',
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
                  placeholder="Nhập lại mật khẩu"
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
                    fontFamily: 'Gilroy-Regular',
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



            <Button onPress={handleSubmit} isDisabled={isLoading} isLoading={isLoading} borderRadius={12} height={12}>
              Đăng ký
            </Button>

            <HStack justifyContent="center" alignItems="center">
              <Text color="coolGray.600">Đã có tài khoản? </Text>
              <Pressable isDisabled={isLoading}>
                <Text color="primary.600" fontWeight="semibold" onPress={() => router.push(ROUTES.LOGIN as any)}>Đăng nhập</Text>
              </Pressable>
            </HStack>
          </VStack>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
