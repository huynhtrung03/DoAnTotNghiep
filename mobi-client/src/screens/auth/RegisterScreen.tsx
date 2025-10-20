import { View, ScrollView, ImageBackground, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import RegisterForm from '../../components/auth/RegisterForm';
import AuthHeader from '../../components/auth/AuthHeader';

export default function RegisterScreen() {
  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require('../../../assets/images/anh3.jpg')}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <View style={{ flex: 1, backgroundColor: 'rgba(245,245,245,0.85)' }}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={{ paddingTop: 24, paddingHorizontal: 16 }}>
            <AuthHeader />
          </View>
          <ScrollView 
            contentContainerStyle={{ 
              flexGrow: 1, 
              alignItems: 'center', 
              justifyContent: 'center', 
              paddingHorizontal: 16,
              paddingBottom: 20
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ width: '100%', maxWidth: 420 }}>
              <RegisterForm />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}