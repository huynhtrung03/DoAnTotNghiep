import React from 'react';
import { View, StyleSheet } from 'react-native';
import SuggestAddressBar from '../../components/filters/SuggestAddressBar/SuggestAddressBar';
import styles from '../../styles/screens/test/TestSuggestAddressBar.styles';

export default function TestSuggestAddressBar() {
  const handleAddressChange = (address: any) => {
    console.log('Address changed:', address);
  };

  const handleSaveSuccess = () => {
    console.log('Address saved successfully!');
  };

  return (
    <View style={styles.container}>
      <SuggestAddressBar
        showSaveButton={true}
        onChange={handleAddressChange}
        onSaveSuccess={handleSaveSuccess}
      />
    </View>
  );
}

