import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import React from 'react';
import { RootStackParamList } from '../App';
import { StackScreenProps } from '@react-navigation/stack';

export type SideBarScreenProps = StackScreenProps<RootStackParamList, "SideBar">; 

const SideBarComponent = ({ navigation }:SideBarScreenProps) => {
  const navigateToScreen = (screenName:any) => () => {
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.item} onPress={navigateToScreen('Home')}>
        <Text>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={navigateToScreen('Profile')}>
        <Text>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={navigateToScreen('Feed')}>
        <Text>Feed</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  item: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
});

export default SideBarComponent;