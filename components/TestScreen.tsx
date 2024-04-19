import { Text, View } from 'react-native';

import React from 'react';
import { RootStackParamList } from '../App';
import { StackScreenProps } from '@react-navigation/stack';

export type LoginScreenProps = StackScreenProps<RootStackParamList, "Test">; 

const TestScreen = ({ navigation }:LoginScreenProps) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Test Screen</Text>
    </View>
  );
};

export default TestScreen;