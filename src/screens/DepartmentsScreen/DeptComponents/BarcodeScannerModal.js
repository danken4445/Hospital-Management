import React from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';
import { Button } from 'react-native-paper';

const BarcodeScannerModal = ({
  modalVisible,
  setModalVisible,
  scanning,
  setScanning,
  handleBarCodeScanned,
  styles,
}) => (
  <Modal
    visible={modalVisible}
    transparent={false}
    animationType="slide"
    onRequestClose={() => setModalVisible(false)}
  >
    <View style={styles.scannerContainer}>
      {scanning && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={handleBarCodeScanned}
          barCodeScannerSettings={{
            barCodeTypes: ['qr', 'ean13', 'code128'],
          }}
        />
      )}
      <Button
        mode="contained"
        onPress={() => {
          setScanning(false);
          setModalVisible(false);
        }}
        style={styles.closeScannerButton}
      >
        Close Scanner
      </Button>
    </View>
  </Modal>
);

export default BarcodeScannerModal;
