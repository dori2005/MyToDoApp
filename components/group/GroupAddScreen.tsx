import { Dimensions, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { theme, todoPalette } from '../util/color';

import { RootStackParamList } from '../../App';
import { StackScreenProps } from '@react-navigation/stack';

export type GroupTestScreenProps = StackScreenProps<RootStackParamList, "GroupTest">; 

const {height: SCREEN_HEIGHT, width:SCREEN_WIDTH} = Dimensions.get('window')

const GroupAddScreen = ({ navigation }:GroupTestScreenProps) => {
  const [isPublic, setIsPublic] = useState(true);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupColor, setGroupColor] = useState('#000000'); // 기본 색상은 검정색으로 설정
  const [isTextInputFocused, setIsTextInputFocused] = useState(false);
  const [color, setColor] = useState(0);

  const handleCreateGroup = () => {
    // 그룹 생성 로직을 추가할 수 있습니다. 이 예시에서는 간단하게 콘솔에 출력합니다.
    console.log('Group Name:', groupName);
    console.log('Group Description:', groupDescription);
    console.log('Group Color:', groupColor);
  };
  const handleCancel = () => {
    // 그룹 생성 로직을 추가할 수 있습니다. 이 예시에서는 간단하게 콘솔에 출력합니다.
    navigation.pop();
  };

  const handleTouch = () => {
    if (isTextInputFocused) {
      setIsTextInputFocused(false);
      Keyboard.dismiss(); // 키보드 숨기기
    }
  }



  const renderAdditionalInput = () => {
    if (isPublic) {
      return (
        <View>
          <Text style={styles.heading}>그룹원 초대</Text>
          <TextInput
            style={styles.input}
            placeholder="user name"
            value={groupName}
            onFocus={() => setIsTextInputFocused(true)}
          />
        </View>
      );
    }
    return null;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1} // 터치 효과 비활성화
      onPress={handleTouch}
    >
      <View style={styles.containerView}>
        <View style={{...styles.horizontalButtons}}>
            <TouchableOpacity
              onPress={() => setIsPublic(false)}
              style={{...styles.tabButton, borderWidth: !isPublic ? 3 : 0}}
            ><Text style={styles.tabButtonText}>개인</Text></TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsPublic(true)}
              style={{...styles.tabButton, borderWidth:isPublic ? 3 : 0}}
            ><Text style={styles.tabButtonText}>공유</Text></TouchableOpacity>
        </View>
        <Text style={styles.heading}>그룹 이름</Text>
        <TextInput
          style={styles.input}
          placeholder="Group Name"
          value={groupName}
          onChangeText={text => setGroupName(text)}
          onFocus={() => setIsTextInputFocused(true)}
        />
        <Text style={styles.heading}>그룹 설명</Text>
        <TextInput
          style={[styles.input, {height:100}]}
          placeholder="Group Description"
          multiline
          numberOfLines={6}
          textAlignVertical='top'
          returnKeyType='done'
          value={groupDescription}
          onChangeText={text => setGroupDescription(text)}
          onFocus={() => setIsTextInputFocused(true)}
        />
        
        <Text style={styles.heading}>색상 선택</Text>
        <View style={styles.selectContainer}>
          <View style={styles.buttonContainer}>
            {todoPalette.map((tcolor, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.colorButton,{backgroundColor:tcolor}, color === index ? styles.selectedColorButton : null]}
                onPress={() => setColor(index)}
              />
            ))}
          </View>
        </View>  
        {renderAdditionalInput()}
      </View>
      <View style={styles.submitView}>
        <View style={styles.horizontalButtons}>
          <TouchableOpacity style={{...styles.submitButton, backgroundColor:'#ff007b'}} onPress={handleCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{...styles.submitButton, backgroundColor:'#007bff'}} onPress={handleCreateGroup}>
            <Text style={styles.buttonText}>Create Group</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: theme.background
  },
  containerView: {
    width: '100%',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitView: {
    position:'absolute',
    bottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    width: '40%',
    height: 40,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalButtons: {
    paddingBottom:20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    width: '100%',
  },
  tabButton: {
    top:5,
    borderRadius:20,
    borderColor:theme.botBord,
    backgroundColor:theme.background,
    width:SCREEN_WIDTH/4,
    height:SCREEN_HEIGHT/20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonText: {
    top:-2,
    fontFamily: 'KCC-Hanbit',
    fontWeight:"700",
    fontSize:20,
  },
  
  selectContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    width:SCREEN_WIDTH,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  colorButton: {
    paddingVertical: 10,
    margin: 5,
    borderRadius: 5,
    borderColor: '#333',
    alignItems: 'center',
    width: SCREEN_WIDTH / 12,
    height: SCREEN_WIDTH / 12
  },
  selectedColorButton: {
    borderWidth: 2,
    borderColor: '#007bff',
  }
});

export default GroupAddScreen;