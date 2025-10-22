import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Box, Button, FormControl, HStack, Text, VStack } from "native-base";
import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput } from "react-native";

interface OtpCodeFormProps {
    onSubmit: (code: string) => void;
    isLoading?: boolean;
}

export default function OtpCodeForm({ onSubmit, isLoading = false }: OtpCodeFormProps) {
    const [otp, setOtp] = useState(['', '', '', '']);
    const [error, setError] = useState('');
        
    const otpRef = [
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
        useRef<TextInput>(null),
    ];

    const validateForm = () => {
        if (otp.every(digit => digit !== '')) {
            console.log(otp.join(''));
            setError('');
        } else {
            setError('Vui lòng điền đầy đủ mã OTP');
        }
    };

    const handleSubmit = () => {
        validateForm();
    };

    const handleOtpChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text.slice(-1);
        setOtp(newOtp);
        
        if (text && index < 3) {
            otpRef[index + 1].current?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            otpRef[index - 1].current?.focus();
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
                    <Text className='!text-3xl !font-bold !text-primary-500 mt-20'>Mã xác nhận</Text>
                    <Text className='dark:text-gray-50 text-gray-800 text-center'>Chúng tôi đã gửi mã xác nhận tài khoản qua email tai.tranthanh@hcmut.edu.vn</Text>
                    </VStack>
                    
                    <FormControl>
                        <HStack space={3} alignSelf="center">
                            <TextInput
                                ref={otpRef[0]}
                                value={otp[0]}
                                onChangeText={(text) => handleOtpChange(text, 0)}
                                onKeyPress={(e) => handleKeyPress(e, 0)}
                                placeholderTextColor="#9ca3af"
                                keyboardType="number-pad"
                                maxLength={1}
                                autoFocus
                                style={{
                                    width: 60,
                                    height: 80,
                                    borderRadius: 12,
                                    textAlign: 'center',
                                    fontSize: 20,
                                    fontFamily: 'Gilroy-Regular',
                                    color: '#000000',
                                    borderWidth: error ? 2 : 1,
                                    borderColor: error ? '#ef4444' : '#d1d5db',
                                }}
                            />
                            <TextInput
                                ref={otpRef[1]}
                                value={otp[1]}
                                onChangeText={(text) => handleOtpChange(text, 1)}
                                onKeyPress={(e) => handleKeyPress(e, 1)}
                                keyboardType="number-pad"
                                maxLength={1}
                                placeholderTextColor="#9ca3af"
                                style={{
                                    width: 60,
                                    height: 80,
                                    borderRadius: 12,
                                    borderWidth: error ? 2 : 1,
                                    borderColor: error ? '#ef4444' : '#d1d5db',
                                    textAlign: 'center',
                                    fontSize: 20,
                                    fontFamily: 'Gilroy-Regular',
                                    color: '#000000',
                                }}
                            />
                            <TextInput
                                ref={otpRef[2]}
                                value={otp[2]}
                                onChangeText={(text) => handleOtpChange(text, 2)}
                                onKeyPress={(e) => handleKeyPress(e, 2)}
                                keyboardType="number-pad"
                                maxLength={1}
                                placeholderTextColor="#9ca3af"
                                style={{
                                    width: 60,
                                    height: 80,
                                    borderRadius: 12,
                                    borderWidth: error ? 2 : 1,
                                    borderColor: error ? '#ef4444' : '#d1d5db',
                                    textAlign: 'center',
                                    fontSize: 20,
                                    fontFamily: 'Gilroy-Regular',
                                    color: '#000000',
                                }}
                            />
                            <TextInput
                                ref={otpRef[3]}
                                value={otp[3]}
                                onChangeText={(text) => handleOtpChange(text, 3)}
                                onKeyPress={(e) => handleKeyPress(e, 3)}
                                keyboardType="number-pad"
                                maxLength={1}
                                placeholderTextColor="#9ca3af"
                                style={{
                                    width: 60,
                                    height: 80,
                                    borderRadius: 12,
                                    borderWidth: error ? 2 : 1,
                                    borderColor: error ? '#ef4444' : '#d1d5db',
                                    textAlign: 'center',
                                    fontSize: 20,
                                    fontFamily: 'Gilroy-Regular',
                                    color: '#000000',
                                }}
                            />
                        </HStack>  

                        {error && (
                            <Text color="red.500" fontSize="sm" textAlign="center" marginTop={5}>
                                {error}
                            </Text>
                        )}
                    </FormControl>


                    <Button onPress={handleSubmit} isDisabled={isLoading} isLoading={isLoading} borderRadius={12} height={12}>
                        Xác nhận
                    </Button>
                </VStack>
                </Box>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}