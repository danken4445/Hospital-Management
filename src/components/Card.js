// Card.js
import React from 'react';
import { Card, Title } from 'react-native-paper';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';

const FeatureCard = ({ title, icon, onPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress} style={styles.touchable}>
        <Card mode="outlined"  style={styles.card}>
          <Card.Content style={styles.content}>
            {/* Displaying the passed icon */}
            {icon && <Image source={icon} style={styles.icon} />}
            <Title style={styles.title}>{title}</Title>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 0,
    width: 150,
    height: 150,
  },
  touchable: {
    flex: 1,
  },
  card: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:24,
    borderColor: '#1C2B39',  
    margin: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 75,
    height: 75,
    marginTop: 10,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold'

  },
});

export default FeatureCard;
