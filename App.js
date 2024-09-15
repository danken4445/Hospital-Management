// App.js
import React from 'react';
import Navigation from './src/navigation/Navigation.js';
import { GluestackUIProvider, Text } from "@gluestack-ui/themed"


export default function App() {
  return (
    <GluestackUIProvider>      
      <Navigation>
      </Navigation>
    </GluestackUIProvider>
  );
};
