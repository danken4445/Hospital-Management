import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const TabButton = ({ title, isActive, onPress, isLandscape = false }) => {
  return (
    <TouchableOpacity
      style={[
        isLandscape ? styles.landscapeButton : styles.button,
        isActive && (isLandscape ? styles.landscapeActiveButton : styles.activeButton)
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          isLandscape ? styles.landscapeButtonText : styles.buttonText,
          isActive && (isLandscape ? styles.landscapeActiveText : styles.activeText)
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Portrait button styles
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  activeButton: {
    backgroundColor: '#4ECDC4',
  },
  buttonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  activeText: {
    color: '#fff',
  },

  // Landscape button styles
  landscapeButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 4,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  landscapeActiveButton: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  landscapeButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  landscapeActiveText: {
    color: '#fff',
  },
});

export default TabButton;