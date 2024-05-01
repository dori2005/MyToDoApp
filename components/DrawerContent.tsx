import {Avatar, Title} from 'react-native-paper';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import {StyleSheet, Text, View} from 'react-native';

import LoginScreen from './LoginScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';

interface DrawerListEle {
    icon: keyof typeof MaterialCommunityIcons.glyphMap,
    label:string,
    navigateTo:string,
}

const DrawerList:DrawerListEle[] = [
  {icon: "home-outline", label: '홈', navigateTo: 'Home'},
  {icon: "account-multiple", label: '프로필', navigateTo: 'Profile'},
  {icon: "account-group", label: '그룹 메뉴', navigateTo: 'Group'},
  {icon: "calendar-today", label: '기념일 설정', navigateTo: 'Anniversary'},
];
const DrawerLayout = ({icon, label, navigateTo}:DrawerListEle) => {
  const navigation = useNavigation();
  // console.log(userData);
  return (
    <DrawerItem
      icon={({color, size}) => <MaterialCommunityIcons name={icon} color={color} size={size} />}
      label={label}
      onPress={() => {
        navigation.navigate(navigateTo as never);
      }}
    />
  );
};

const DrawerItems = (props:any) => {
    return DrawerList.map((el, i) => {
      return (
        <DrawerLayout
          key={i}
          icon={el.icon}
          label={el.label}
          navigateTo={el.navigateTo}
        />
      );
    });
  };
function DrawerContent(props:any) {
    const navigation = useNavigation();
  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <TouchableOpacity activeOpacity={0.8} 
            onPress={()=> navigation.navigate("Login" as never)}
          >
            <View style={styles.userInfoSection}>
              <View style={{flexDirection: 'row', marginTop: 15}}>
                <Avatar.Image
                  source={{
                    uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAuVJREFUeAHtl4FxwyAMRZNeJ+ownaRjdJIO05XaKIc4RTFIWPrYvZK7HNgISf8hsH25rN8isAgsAovA/yVwPbH0H5EbLE+Y41vyEQE/Xx9vVf/75zf1IbkinN6FbwjwingQzxRQELIBbCZPIoQAWRms76GV8OSA8CFvh/qvodnjk5uA2BWJLEIvLRBsm9FOAUCCvGKk3ci8vTBe9k70zouIIBhcDaXN3rKQk7UeghHxDJgB3K7TxVMMiNOSfAVRrnc3qNWnhKBbQO5nCkZCxIrSrfrrjVUjQAcKAJBvusspTwHOWlcE36e2NybtsvtTAcjk5VY4Sjzlc9gWYNHcSjiyX0DBDmskgKtcZS2Kxkg8tS07OQfVh5EtCZuvvj1hBQw0R6hzhkCtVeoaxAzxFHMGANbmejES22FKbugg5qcv0+m00BxRzqvw0dLXINAVgQAQOvg0AL5Ggch+DNaV58SzWlFJqTEyAdwTE4lmaa9+EL4zAQw/6qqygU6BkFYFWQCa+17sXbdMa04mhAwATfFuxcqQBBIEC8RtWrgSogC6CZCA4L5tfk8E/VbkUQBNgY7Vq0kYHQtCdxEM36HP4WbgIj7zHQMGIVQBW2UIEM+L2ITABnvaEAAdECieQz1BiG61aJnqbaD97X5CGDCtuAzMbKMVQILl3wzoNSjbSwvl6TKmhs42rjYKwBXkzEYLwJlXZ0ZuyApo7d8ZutwxkACab4ne7IyD0Ouma4cC8CdWn8igAIRXn5cNXQUwACzg7C0CgLv86W3P8yqLrAIEgLTyn1E9EACexMW7/tMHjmd+ls1hAJQALwT39lL+m5eHABCr30xMD5RzQN8OX2cDSF+hsELDQTYA8wDsnPrebWBIGhtOB9ALL8SHvuF7MUbHpgIoyfXET6+CIwBYizQVwjQAovwtAPfxUXuX0w2jXjlumJu37k8B/cgSYkbitZ4oIz7MhFOdlWhTEjeVLYNFYBFYBBwEfgEKONfs8pY2HQAAAABJRU5ErkJggg==',
                  }}
                  size={50}
                  style={{marginTop: 5}}
                />
                <View style={{marginLeft: 15, flexDirection: 'column'}}>
                  <Title style={styles.title}>도훈</Title>
                  <Text style={styles.caption} numberOfLines={1}>
                    test@test.com
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.drawerSection}>
            <DrawerItems />
          </View>
        </View>
      </DrawerContentScrollView>
      <View style={styles.bottomDrawerSection}>
        <DrawerItem
          icon={({color, size}) => (
            <MaterialCommunityIcons name="exit-to-app" color={color} size={size} />
          )}
          label="Sign Out"
          onPress={()=>{}}
        />
      </View>
    </View>
  );
}
export default DrawerContent;

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 15,
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 13,
    lineHeight: 14,
    // color: '#6e6e6e',
    width: '100%',
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginRight: 15,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
    borderBottomColor: '#dedede',
    borderBottomWidth: 1,
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: '#dedede',
    borderTopWidth: 1,
    borderBottomColor: '#dedede',
    borderBottomWidth: 1,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});