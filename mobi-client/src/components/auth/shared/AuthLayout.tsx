// Layout chung cho tất cả màn hình Auth
import React from 'react';
import {
  View,
  ImageBackground,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  StatusBar,
} from 'react-native';

interface AuthLayoutProps {
  children: React.ReactNode;
  showLogo?: boolean;
}

/**
 * Layout wrapper cho các màn hình Auth
 * Bao gồm: Background image, Keyboard handling, ScrollView
 */
export default function AuthLayout({ children, showLogo = true }: AuthLayoutProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Image */}
      <ImageBackground
        source={require('../../../../assets/images/anh3.jpg')}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      
      {/* Overlay */}
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={true}
          >
            {/* Logo Section */}
            {showLogo && (
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <ImageBackground
                    source={require('../../../../assets/icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
              </View>
            )}
            
            {/* Content */}
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'center',
    minHeight: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 70,
    height: 70,
  },
});
