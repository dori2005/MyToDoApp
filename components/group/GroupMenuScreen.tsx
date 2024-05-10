import { Dimensions, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import { Group } from '../object/Group';
import GroupAddScreen from './GroupAddScreen'
import { Realm } from 'realm';
import { RootStackParamList } from '../../App';
import { StackScreenProps } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { theme } from '../util/color';

const {height: SCREEN_HEIGHT, width:SCREEN_WIDTH} = Dimensions.get('window');

export type GroupMenuScreenProps = StackScreenProps<RootStackParamList, "Group">; 

interface GroupData {
  id:string,
  title:string,
  text:string,
  color:number
};

var realm:Realm;
const GroupMenuScreen = ({ navigation }:GroupMenuScreenProps) => {
    const [isPublic, setIsPublic] = useState(true);
    const [groups, setGroups] = useState<GroupData[]>([]);

    const addButton = () => {
      navigation.push("GroupTest");
    }
    
    useEffect(()=>{
      openLocalDB();
      realmRoadGroups(isPublic);

      return () => {
        realm?.close();
      };
    },[])

    useEffect(()=>{
      realmRoadGroups(isPublic);
    },[isPublic])

    const openLocalDB = async () => {
      try {
        realm = await Realm.open({
          schema: [Group],
          schemaVersion: 12,
        });
      }catch(e) {
        console.log(e);
      }
    };

    const realmRoadGroups = (isPublic:boolean) => {
      console.log("|GroupMenu| road Groups - " + isPublic);
      const tasks = realm?.objects('Group').filtered(`ispublic = '${isPublic}'`);
      console.log("|GroupMenu| road complete Groups");
      console.log(tasks);

      const newGroups:GroupData[] = [];
      tasks.map((ob:any)=>{
        newGroups.push({"id":ob["id"],
          "title":ob["title"], "text":ob["text"],
          "color":ob["color"] });
      })
      setGroups(newGroups);
    }
    // 그룹 생성 및 관리 스크린
    const createGroup = () => {

    }

    const updateGroup = () => {

    }

    const deleteGroup = () => {

    }

    const loadGroup = () => {

    }

    const printGroups = () => {
      return (groups.map((val, idx) => (  // Object.keys(printList)의 output : [key1, key2,...] 자세한건 notion에
        <View key={val.id}>
          <View style={styles.toDo}>
            <TouchableOpacity style={{ flexDirection: "row" }}>
                  <Text/>
                <TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={{ paddingRight: 10 }}>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.toDoUnderLine}/>
        </View>
      ))
      )
    }


    return (
      <View style={styles.container}>
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
        <View style={styles.add_button_view}>
          <TouchableOpacity style={styles.add_todo_button} onPress={addButton}>
            <View>
              <View style={styles.crossVertical} />
              <View style={styles.crossHorizon} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    top:10
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

  add_button_view: {
    width: 60,
    height: 60,
    position: 'absolute',
    flexDirection: "column-reverse",
    right: 20,
    bottom: 20,
  },
  add_todo_button: {
    width: 60,
    height: 60,
    borderRadius: 60/2,
    backgroundColor: 'grey',
    alignItems:"center",
    justifyContent: "center"
  },
  crossVertical: {
    backgroundColor: "white",
    height: 36,
    width: 6,
    borderRadius: 2,
  },
  crossHorizon: {
    backgroundColor: "white",
    height: 6,
    width: 36,
    borderRadius: 2,
    position: "absolute",
    left: -15,
    top: 15,
  },

  toDoBoxText: {
    top: -25,
    left: 10,
    paddingHorizontal: 13,
    position:"absolute",
    fontFamily:"KCC-Hanbit",
    fontSize:30,
    fontWeight:"500",
    backgroundColor: theme.todoListContainer
  },
  toDoBox: {
    marginTop: 30,
    paddingTop:15,
    paddingHorizontal:10,
    borderWidth:3,
    borderRadius:10,
    borderColor: theme.toDoText,
  },
  toDo: {
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoUnderLine: {
    top:-SCREEN_HEIGHT/60,
    left:60,
    backgroundColor: theme.toDoText,
    height:2,
    width:SCREEN_WIDTH/2,
  },
  toDoCheckBox: {
    position:"absolute",
    top:-SCREEN_HEIGHT/150,
    borderWidth:4,
    borderRadius:4,
    borderColor: theme.toDoBg,
  },
  toDoText: {
    marginLeft:SCREEN_WIDTH/10,
    fontFamily:"KCC-Hanbit",
    color: theme.toDoText,
    fontSize: 16,
    fontWeight: "500",
    paddingHorizontal: 10,
    maxWidth: 205
  }
});

export default GroupMenuScreen;