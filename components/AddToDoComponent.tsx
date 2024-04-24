
import { View, TextInput, Button, StyleSheet, Alert, TouchableHighlight, Text, Modal, Platform, Dimensions } from 'react-native';
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../App";
import React, { useEffect, useState } from 'react';
import Realm from 'realm'
import server from './util/saveTodo';
import { Schedule, ScheduleData } from './Object/Schedule';
import { ToDo } from './Object/ToDo';
import { TouchableOpacity } from 'react-native-gesture-handler';


interface AddToDoProps {   // 하위 컴포넌트가 삽입되었을때, 연동시키는 부분
    selectDate:Date;
    onAddToDo: (key:string, text:string) => boolean;
    swichAddAction:(canceled:boolean)=>void;
}

interface AddToDoRefProps {    //TS에서 메소드를 export하기위한 type 선언 같이 보임. 
}   //이후 useImperativeHandle로 input과 output을 조립하는듯 하다.

const {height: SCREEN_HEIGHT, width:SCREEN_WIDTH} = Dimensions.get('window')

var realm:Realm;
const AddToDoComponent = React.forwardRef<AddToDoRefProps, AddToDoProps>(({selectDate, onAddToDo, swichAddAction}, ref) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('ToDo');
    const [date, setDate] = useState(selectDate.getDate().toString());

    //의문인건 이전처럼 depth에 넣어서 변경시 처리를 할 수 있을지 의문이다.
    const handleSaveAdd = async() => {
        //trim 으로 양쪽 공백을 제거한 문자열만 반환
        if (title.trim() === '' || type === null ) {
            Alert.alert('Error', 'Please enter all fields.');
        } else {
            // Save schedule logic here (e.g., send to backend or store locally)
            console.log('Title:', title);
            console.log('Type:', type);
            const add = await addToDo();
            if(add)
                swichAddAction(false);
            else
                Alert.alert('Error', '잘못된 요청 입니다.');
        }
    };

    const handleCancelAdd = () => {
        swichAddAction(true);
    }

    useEffect(()=>{
        setDate(selectDate.getDate().toString());
      },[selectDate])
    useEffect(()=>{
      openLocalDB();

      return () => {
        realm?.close();
      };
    },[])

    const openLocalDB = async () => {
      try {
        realm = await Realm.open({
          schema: [ToDo, Schedule],
          schemaVersion: 11,
        });
      }catch(e) {
        console.log(e);
      }
    };

    const realmCreateSchedule = (key:string, data:ScheduleData) => {
        realm?.write(() => {
          realm.create('Schedule', {
              id: key,
              text: data.text,
              date: data.date,
              complete: data.complete,
          })
        });
      }
  
    
    const addToDo = async () => {
        const time = Date.now().toString();
        console.log("Key : "+time);
        const select = selectDate.getFullYear().toString()+selectDate.getMonth().toString()+selectDate.getDate().toString()
        console.log("select date : "+select);
        const data = { text:title, complete: false };
        const schedule_data = { text:title, date:select, complete: false, color: 0 };
    
        realmCreateSchedule(time, schedule_data);
        setTitle('');
        setType('Todo');
        setDate('');
        //await server.renewUpdate(0, time, data);
        return onAddToDo(time, title);
    }

    const [selectedDays, setSelectedDays] = useState([false, false, false, false, false, false, false]);
    const daysOfWeek = ['월', '화', '수', '목', '금', '토', '일'];

    const toggleDay = (index:number) => {
        const updatedDays = [...selectedDays];
        updatedDays[index] = !updatedDays[index];
        setSelectedDays(updatedDays);
    };


      const renderAdditionalInput = () => {
        if (type === 'Schedule') {
          return (
            <TextInput
              style={styles.input}
              placeholder="Enter date"
              value={date}
              onChangeText={(text) => setDate(text)}
            />
          );
        } else if (type === 'Hobby') {
          return (
            <View style={styles.selecContainer}>
              <Text style={styles.heading}>Select Days:</Text>
              <View style={styles.buttonContainer}>
                {daysOfWeek.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.button, selectedDays[index] ? styles.selectedButton : null]}
                    onPress={() => toggleDay(index)}
                    >
                    <Text style={[styles.buttonText, selectedDays[index] ? styles.selectedText : null]}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text>Selected Days: {selectedDays.map((selected, index) => (selected ? daysOfWeek[index] + ' ' : null))}</Text>
            </View>
          );
        }
        return null;
      };

  
    return (
        <View style={styles.container}>
            <TextInput
            onChangeText={(text)=>setTitle(text)}
            returnKeyType='done'
            value={title}
            placeholder={ "Enter To Do" }
            style={styles.input}></TextInput>
            <View style={styles.horizontalButtons}>
                <Button
                    title="ToDo"
                    onPress={() => setType('ToDo')}
                    color={type === 'ToDo' ? '#007bff' : '#333'}
                />
                <Button
                    title="Schedule"
                    onPress={() => setType('Schedule')}
                    color={type === 'Schedule' ? '#007bff' : '#333'}
                />
                <Button
                    title="Hobby"
                    onPress={() => setType('Hobby')}
                    color={type === 'Hobby' ? '#007bff' : '#333'}
                />
            </View>
            {renderAdditionalInput()}
            <View style={styles.horizontalButtons}>
                <Button 
                    title="Cancel" onPress={handleCancelAdd}
                    color={'red'}
                />
                <Button title="Save" onPress={handleSaveAdd} />
            </View>
        </View>
    );
  });
  
  const styles = StyleSheet.create({
    container: {
        height: SCREEN_HEIGHT*153/200,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f0f0',
    },
    input: {
        width: '100%',
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    horizontalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        width: '100%',
    },
    
    selecContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading: {
        fontSize: 18,
        marginBottom: 10,
    },    
    buttonContainer: {
        width:SCREEN_WIDTH,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    button: {
        paddingVertical: 10,
        margin: 5,
        borderRadius: 5,
        borderColor: '#333',
        alignItems: 'center',
         width: SCREEN_WIDTH / 12
    },
    selectedButton: {
        backgroundColor: '#007bff',
    },
    buttonText: {
        fontSize: 16,
    },
    selectedText: {
        color: '#fff',
    },
    
});
  
  export default AddToDoComponent;