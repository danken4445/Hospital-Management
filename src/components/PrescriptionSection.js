const PrescriptionSection = ({ prescriptions, addPrescription, handleAddPrescription, handlePrescriptionSubmit, errors, prescriptionName, setPrescriptionName, dosage, setDosage, instruction, setInstruction, loading, fetchPrescriptions, renderPrescriptions }) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeader}>Prescriptions</Text>
      {!addPrescription ? (
        <Button title="Add Prescription" color="#2196F3" onPress={handleAddPrescription} />
      ) : (
        <View style={styles.prescriptionForm}>
          <TextInput
            style={[styles.input, errors.prescriptionName ? styles.errorInput : null]}
            label="Prescription Name"
            placeholder="Enter prescription name"
            value={prescriptionName}
            onChangeText={(text) => setPrescriptionName(text)}
          />
          {errors.prescriptionName && <Text style={styles.errorText}>{errors.prescriptionName}</Text>}
          <TextInput
            style={[styles.input, errors.dosage ? styles.errorInput : null]}
            label="Dosage"
            placeholder="Enter dosage"
            value={dosage}
            onChangeText={(text) => setDosage(text)}
          />
          {errors.dosage && <Text style={styles.errorText}>{errors.dosage}</Text>}
          <TextInput
            style={[styles.input, errors.instruction ? styles.errorInput : null]}
            label="Instruction"
            placeholder="Enter instructions"
            value={instruction}
            onChangeText={(text) => setInstruction(text)}
          />
          {errors.instruction && <Text style={styles.errorText}>{errors.instruction}</Text>}
          <Button title={loading ? 'Adding...' : 'Add Prescription'} onPress={handlePrescriptionSubmit} disabled={loading} />
          <Button title="Cancel" onPress={() => setAddPrescription(false)} />
        </View>
      )}
      <Button title="View Prescription" color="#673AB7" onPress={fetchPrescriptions} />
      <ScrollView>{renderPrescriptions()}</ScrollView>
    </View>
  );