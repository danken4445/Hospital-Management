const InventorySection = ({ suppliesUsed, medUse, handleScan, renderUsedItems }) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeader}>Inventory</Text>
      <Text style={styles.label}>Supplies Used</Text>
      {renderUsedItems(suppliesUsed)}
      <Button title="Scan Item for Supplies" color="#4CAF50" onPress={() => handleScan('supplies')} />
      <Text style={styles.label}>Medicines Used</Text>
      {renderUsedItems(medUse)}
      <Button title="Scan Item for Medicines" color="#FF5722" onPress={() => handleScan('medicines')} />
    </View>
  );