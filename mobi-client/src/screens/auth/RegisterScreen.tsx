import { View, ScrollView, ImageBackground, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import RegisterForm from '../../components/auth/RegisterForm';
import AuthHeader from '../../components/auth/AuthHeader';
import styles from '../../styles/screens/auth/RegisterScreen.styles';

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/images/anh3.jpg')}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <View style={styles.backgroundOverlay}>
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.headerContainer}>
            <AuthHeader />
          </View>
          <ScrollView 
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formContainer}>
              <RegisterForm />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}