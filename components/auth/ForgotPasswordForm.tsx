import { Box, Text, VStack } from "native-base";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

export default function ForgotPasswordForm() {
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
              <Text className='!text-3xl !font-bold !text-primary-500'>Quên mật khẩu</Text>
              <Text className='dark:text-gray-50 text-gray-800'>Vui lòng điền email tài khoản để đặt lại mật khẩu</Text>
            </VStack>
          </VStack>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
