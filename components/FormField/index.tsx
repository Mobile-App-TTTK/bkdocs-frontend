import React from 'react';
import { Text, TextInput, View } from 'react-native';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  keyboardType?: string;
  disabled?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  disabled = false,
}) => {
  return (
    <View className="mb-4">
      <Text
        className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-[Gilroy-Medium]"
      >
        {label}
      </Text>
      <View
        className={`h-14 rounded-xl border px-4 justify-center ${
          disabled
            ? 'bg-gray-100 border-gray-300 dark:bg-dark-700 dark:border-gray-600'
            : 'bg-white border-gray-300 dark:bg-dark-800 dark:border-gray-700'
        }`}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          keyboardType={keyboardType as any}
          editable={!disabled}
          selectTextOnFocus={!disabled}
          className={`text-base pb-1 ${
            disabled ? 'text-gray-500 dark:text-gray-400' : 'text-black dark:text-white'
          }`}
          style={{
            flex: 1,
            fontSize: 16,
            color: '#000000',
            fontFamily: 'Gilroy-Regular'
          }}
        />
      </View>
    </View>
  );
};

export default FormField;
