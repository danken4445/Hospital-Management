import React from 'react';
import { Card, TextInput, Button, Modal as PaperModal } from 'react-native-paper';

const QuantityModal = ({
  quantityModalVisible,
  setQuantityModalVisible,
  itemDisplayName,
  currentScannedItem,
  quantity,
  setQuantity,
  handleQuantityConfirm,
  styles,
}) => (
  <PaperModal
    visible={quantityModalVisible}
    onDismiss={() => setQuantityModalVisible(false)}
  >
    <Card style={styles.modalContent}>
      <Card.Title title={`Enter Quantity for ${itemDisplayName}`} />
      <Card.Content>
        <TextInput
          label="Available Quantity"
          value={String(currentScannedItem?.quantity || 0)}
          mode="outlined"
          style={styles.input}
          editable={false}
        />
        <TextInput
          label="Quantity to Use"
          value={quantity}
          onChangeText={setQuantity}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
        />
      </Card.Content>
      <Card.Actions style={styles.modalActions}>
        <Button onPress={() => setQuantityModalVisible(false)}>Cancel</Button>
        <Button onPress={handleQuantityConfirm}>Confirm</Button>
      </Card.Actions>
    </Card>
  </PaperModal>
);

export default QuantityModal;
