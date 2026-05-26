import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { logTaskCompletion } from '../db/database';
import { callGroq } from '../api/groq';
import { speak } from '../engine/voice';
import { SCENARIO_PROFILES } from '../constants/profiles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toBool } from '../utils/bool';
import Toast from 'react-native-toast-message';

const TASKS = ['Brush Teeth','Breakfast','Lunch','Playing Game','Dinner','Sleep'];

export default function ScheduleScreen({ route }) {
  const { childId } = route.params;
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState({});

  async function handleCheck(task) {
    if (toBool(checked[task])) return; 
    setLoading(prev => ({ ...prev, [task]: true }));

    try {
      await logTaskCompletion(childId, task);
      setChecked(prev => ({ ...prev, [task]: true }));

      Toast.show({
        type: 'success',
        text1: 'Task Completed!',
        text2: `Great job finishing "${task}".`,
        position: 'top'
      });

      const storedRole = await AsyncStorage.getItem('currentRole') || 'parent';
      const profile = SCENARIO_PROFILES[storedRole] || SCENARIO_PROFILES.parent;

      const response = await callGroq([
        { role: 'system', content: `${profile.role}\nONE sentence only. Maximum 10 words. Celebrate completing "${task}" warmly. No questions.` },
        { role: 'user',   content: `I finished ${task}!` }
      ], 40);
      await speak(response);
    } catch {
      await speak(`Amazing job finishing ${task}!`);
    } finally {
      setLoading(prev => ({ ...prev, [task]: false }));
    }
  }

  // DEBUG: Prop Audit before render
  console.log('[DEBUG] ScheduleScreen Render State:', {
    checked: { keys: Object.keys(checked), type: typeof checked },
    loading: { keys: Object.keys(loading), type: typeof loading },
    childId: { value: childId, type: typeof childId },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title} accessible={true} accessibilityRole="header">My Day</Text>
      <Text style={styles.sub}>Tick each task when you finish it!</Text>
      {TASKS.map(task => {
        const isChecked = toBool(checked[task]);
        const isLoading = toBool(loading[task]);
        const isDisabled = isChecked === true || isLoading === true;

        return (
          <TouchableOpacity
            key={task}
            style={[
              styles.task, 
              isChecked === true ? styles.taskDone : null
            ]}
            onPress={() => handleCheck(task)}
            disabled={isDisabled === true}
            accessible={true}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isChecked === true }}
            accessibilityLabel={`Mark ${task} as complete`}
          >
            <Text style={styles.taskIcon}>
              {isChecked === true ? 'DONE' : 'TODO'}
            </Text>
            <Text style={[
              styles.taskLabel, 
              isChecked === true ? styles.taskLabelDone : null
            ]}>
              {task}
            </Text>
            {isLoading === true ? <ActivityIndicator size="small" color="#3F51B5" /> : null}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { flexGrow:1, padding:20 },
  title:         { fontSize:24, fontWeight:'bold', textAlign:'center', marginBottom:12 },
  sub:           { fontSize:14, color:'#888', textAlign:'center', marginBottom:12 },
  task:          { flexDirection:'row', alignItems:'center', padding:16, borderRadius:14, backgroundColor:'#F9F9F9', borderWidth:1, borderColor:'#ddd', marginBottom:12 },
  taskDone:      { backgroundColor:'#E8F5E9', borderColor:'#A5D6A7' },
  taskIcon:      { fontSize:14, fontWeight: 'bold', marginRight: 12 },
  taskLabel:     { fontSize:18, flex:1 },
  taskLabelDone: { color:'#888', textDecorationLine:'line-through' },
  loading:       { color:'#999', fontSize:14 },
});
