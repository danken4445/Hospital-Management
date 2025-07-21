import React, { useState } from 'react';
import { Modal, View } from 'react-native';
import { TextInput, Button, Portal, Card, Title, Paragraph } from 'react-native-paper';

const QuantityModal = ({ visible, item, onConfirm, onDismiss }) => {
  const [quantity, setQuantity] = useState('');

  const handleConfirm = () => {
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0 || parsedQuantity > item?.quantity) {
      return;
    }
    // Just pass the quantity to add to scanned items, don't deduct from inventory yet
    onConfirm(parsedQuantity);
    setQuantity('');
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        transparent
        animationType="fade"
      >
        <Card style={modalStyles.container}>
          <Card.Title title="Enter Quantity" />
          <Card.Content>
            {item && (
              <View style={modalStyles.itemInfo}>
                <Title>{item.name}</Title>
                <Paragraph>Available: {item.quantity}</Paragraph>
                <Paragraph style={{ color: '#666', fontSize: 12, marginTop: 5 }}>
                  Note: Inventory will be updated when you save changes
                </Paragraph>
              </View>
            )}
            <TextInput
              label="Quantity to use"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              style={modalStyles.input}
              error={
                quantity &&
                (isNaN(parseInt(quantity)) ||
                  parseInt(quantity) <= 0 ||
                  parseInt(quantity) > item?.quantity)
              }
            />
          </Card.Content>
          <Card.Actions style={modalStyles.actions}>
            <Button onPress={onDismiss}>Cancel</Button>
            <Button 
              onPress={handleConfirm}
              mode="contained"
              disabled={
                !quantity ||
                isNaN(parseInt(quantity)) ||
                parseInt(quantity) <= 0 ||
                parseInt(quantity) > item?.quantity
              }
            >
              Add to List
            </Button>
          </Card.Actions>
        </Card>
      </Modal>
    </Portal>
  );
};

const modalStyles = {
  container: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 5
  },
  itemInfo: {
    marginBottom: 15
  },
  input: {
    marginBottom: 10
  },
  actions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 15,
    paddingBottom: 10
  }
};

export default QuantityModal;
