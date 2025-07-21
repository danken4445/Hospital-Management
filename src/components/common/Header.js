import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';

const Header = ({ title }) => {
  return (
    <Appbar.Header style={styles.header}>
      <Appbar.Content title={title} titleStyle={styles.title} />
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#34495e',
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Header;