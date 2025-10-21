import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Box, Button, FormControl, HStack, Pressable, Text, VStack } from "native-base";
import React, { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from "react-native";

interface ForgotPasswordFormProps {
    onSubmit: (email: string) => void;
    isLoading?: boolean;
}

export default function ForgotPasswordForm({ onSubmit, isLoading = false }: ForgotPasswordFormProps) {
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});

    const router = useRouter();
    const emailRef = useRef<TextInput>(null);

    const validateForm = () => {
        const newErrors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};

        if (!email.trim()) {
            newErrors.email = 'Email là bắt buộc';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit(email.trim());
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
          <Pressable className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mt-10" onPress={() => router.back()}>
              <Ionicons name="chevron-back-outline" size={20} color={"#888888"} style={{marginLeft: -2}}/>
          </Pressable>

          <VStack space={6}>
            <VStack alignItems="center" space={1}>
              <Text className='!text-3xl !font-bold !text-primary-500 mt-20'>Quên mật khẩu</Text>
              <Text className='dark:text-gray-50 text-gray-800'>Vui lòng điền email tài khoản để đặt lại mật khẩu</Text>
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
                          returnKeyType="next"
                          blurOnSubmit={false}
                          editable={!isLoading}
                          enablesReturnKeyAutomatically={true}
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

              <Button onPress={handleSubmit} isDisabled={isLoading} isLoading={isLoading} borderRadius={12} height={12}>
                Đặt lại mật khẩu
              </Button>
              <HStack>

              </HStack>
          </VStack>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
