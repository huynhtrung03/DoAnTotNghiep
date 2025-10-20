import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';

type AuthInputProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secure?: boolean;
};

export default function AuthInput<TFieldValues extends FieldValues>(props: AuthInputProps<TFieldValues>) {
  const { control, name, label, placeholder, keyboardType = 'default', autoCapitalize = 'none', secure } = props;
  const [show, setShow] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
        <View style={{ marginBottom: 10 }}>
          {label ? <Text style={{ marginBottom: 4, color: '#374151', fontSize: 11, fontWeight: '600' }}>{label}</Text> : null}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: error ? '#ef4444' : '#e5e7eb',
              borderRadius: 8,
              backgroundColor: '#fff',
            }}
          >
            <TextInput
              placeholder={placeholder}
              value={(value as unknown as string) ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize={autoCapitalize}
              keyboardType={keyboardType}
              secureTextEntry={secure ? !show : false}
              style={{ flex: 1, padding: 10, fontSize: 14, color: '#111827' }}
            />
            {secure && (
              <Pressable onPress={() => setShow((s) => !s)} style={{ paddingVertical: 6, paddingHorizontal: 10 }}>
                <Text style={{ color: '#2563eb', fontWeight: '600', fontSize: 12 }}>{show ? 'Hide' : 'Show'}</Text>
              </Pressable>
            )}
          </View>
          {error ? <Text style={{ color: '#ef4444', marginTop: 2, fontSize: 11 }}>{error.message as string}</Text> : null}
        </View>
      )}
    />
  );
}