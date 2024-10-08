import React from 'react';
import { View, Modal, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { TextInput } from 'react-native-paper';
import styles from '../screens/AdminScreens/styles';

export const BarcodeScannerModal = ({ modalVisible, handleBarCodeScanned, scanning, setModalVisible }) => (
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

export const QuantityInputModal = ({ quantityModalVisible, scannedItem, setQuantity, handleQuantityConfirm, setQuantityModalVisible, quantity }) => (
  <Modal visible={quantityModalVisible} transparent={true} animationType="slide">
    <View style={styles.quantityModalContainer}>
      <View style={styles.quantityModalContent}>
        {scannedItem && (
          <View style={styles.scannedItemContainer}>
            <Text style={styles.modalLabel}>Scanned Item</Text>
            <Text>Available Quantity: {scannedItem.quantity}</Text>
            <Text>Type: {scannedItem.type}</Text>
          </View>
        )}
        <TextInput
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          placeholder="Enter quantity"
        />
        <Button title="Confirm" onPress={handleQuantityConfirm} />
        <Button title="Cancel" onPress={() => setQuantityModalVisible(false)} />
      </View>
    </View>
  </Modal>
);
