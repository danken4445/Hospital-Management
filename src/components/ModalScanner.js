import React from 'react';
import { View, Button, StyleSheet, Modal } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

const ModalScanner = ({ modalVisible, handleBarCodeScanned, setModalVisible, scanning }) => {
  return (
    <Modal visible={modalVisible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        {scanning ? (
          <BarCodeScanner onBarCodeScanned={scanning ? handleBarCodeScanned : undefined} style={styles.barcodeScanner} />
        ) : (
          <Button title="Close" onPress={() => setModalVisible(false)} />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  barcodeScanner: {
    width: '100%',
    height: '60%',
  },
});

export default ModalScanner;
