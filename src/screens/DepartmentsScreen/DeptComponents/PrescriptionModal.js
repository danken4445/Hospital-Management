import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Modal, StyleSheet, View, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { TextInput, Button, Card } from 'react-native-paper';

const PrescriptionModal = ({ visible, onDismiss, onAdd }) => {
  const [prescription, setPrescription] = useState({
    name: '',
    dosage: '',
    instructions: ''
  });

  const dosageRef = useRef(null);
  const instructionsRef = useRef(null);

  const handleNameChange = useCallback((text) => {
    setPrescription(prev => ({ ...prev, name: text }));
  }, []);

  const handleDosageChange = useCallback((text) => {
    setPrescription(prev => ({ ...prev, dosage: text }));
  }, []);

  const handleInstructionsChange = useCallback((text) => {
    setPrescription(prev => ({ ...prev, instructions: text }));
  }, []);

  const handleAdd = useCallback(() => {
    if (!prescription.name.trim()) return;
    onAdd(prescription);
    setPrescription({ name: '', dosage: '', instructions: '' });
    onDismiss();
  }, [prescription, onAdd, onDismiss]);

  const handleCancel = useCallback(() => {
    setPrescription({ name: '', dosage: '', instructions: '' });
    onDismiss();
  }, [onDismiss]);

  const handleNameSubmit = useCallback(() => {
    dosageRef.current?.focus();
  }, []);

  const handleDosageSubmit = useCallback(() => {
    instructionsRef.current?.focus();
  }, []);

  const isAddDisabled = useMemo(() => !prescription.name.trim(), [prescription.name]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      onRequestClose={handleCancel}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={handleCancel}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Card style={styles.container}>
                  <Card.Title title="Add Prescription" />
                  <Card.Content style={styles.content}>
                    <TextInput
                      label="Medicine Name"
                      value={prescription.name}
                      onChangeText={handleNameChange}
                      style={styles.input}
                      mode="outlined"
                      autoCapitalize="words"
                      returnKeyType="next"
                      onSubmitEditing={handleNameSubmit}
                      blurOnSubmit={false}
                      autoFocus={false}
                    />
                    <TextInput
                      ref={dosageRef}
                      label="Dosage"
                      value={prescription.dosage}
                      onChangeText={handleDosageChange}
                      style={styles.input}
                      mode="outlined"
                      placeholder="e.g., 500mg twice daily"
                      returnKeyType="next"
                      onSubmitEditing={handleDosageSubmit}
                      blurOnSubmit={false}
                    />
                    <TextInput
                      ref={instructionsRef}
                      label="Instructions"
                      value={prescription.instructions}
                      onChangeText={handleInstructionsChange}
                      multiline
                      numberOfLines={3}
                      style={styles.input}
                      mode="outlined"
                      placeholder="e.g., Take after meals"
                      returnKeyType="done"
                      onSubmitEditing={handleAdd}
                    />
                  </Card.Content>
                  <Card.Actions style={styles.actions}>
                    <Button onPress={handleCancel} mode="outlined">
                      Cancel
                    </Button>
                    <Button 
                      onPress={handleAdd} 
                      mode="contained"
                      disabled={isAddDisabled}
                    >
                      Add
                    </Button>
                  </Card.Actions>
                </Card>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    margin: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    marginBottom: 12,
  },
  actions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
});

export default PrescriptionModal;
