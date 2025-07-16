import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { Button, Portal } from 'react-native-paper';
import { CameraView } from 'expo-camera';

const BarcodeScannerModal = ({ visible, onDismiss, onScan }) => {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        animationType="slide"
      >
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.scanner}
            onBarcodeScanned={onScan}
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'ean13', 'code128'],
            }}
          />
          <Button
            mode="contained"
            onPress={onDismiss}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000'
  },
  scanner: {
    flex: 1
  },
  cancelButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20
  }
});

export default BarcodeScannerModal;
