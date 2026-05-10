import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function HomeScreen({ navigation, route }) {
  const { childId } = route.params;

  const modes = [
    { key: 'parent',    label: 'Parent',    color: '#FFE0B2' },
    { key: 'teacher',   label: 'Teacher',   color: '#E1F5FE' },
    { key: 'caretaker', label: 'Caretaker', color: '#E8F5E9' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Who is with you today?</Text>

      {modes.map(m => (
        <TouchableOpacity
          key={m.key}
          style={[
              styles.modeBtn, 
              m.color ? { backgroundColor: m.color } : null
          ]}
          onPress={() => navigation.navigate('Chat', { childId, role: m.key })}
        >
          <Text style={styles.modeTxt}>{m.label}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.scheduleBtn}
        onPress={() => navigation.navigate('Schedule', { childId })}
      >
        <Text style={styles.scheduleTxt}>My Daily Schedule</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.profileBtn}
        onPress={() => navigation.navigate('Profile', { childId })}
      >
        <Text style={styles.profileTxt}>My Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flexGrow:1, padding:24, alignItems:'center', gap:16 },
  title:       { fontSize:22, fontWeight:'bold', marginBottom:8, textAlign:'center' },
  modeBtn:     { width:'100%', padding:20, borderRadius:16, alignItems:'center', marginBottom:16 },
  modeTxt:     { fontSize:20, fontWeight:'600' },
  scheduleBtn: { width:'100%', padding:18, borderRadius:16, backgroundColor:'#F3E5F5', alignItems:'center', marginTop:8, marginBottom:16 },
  scheduleTxt: { fontSize:18, fontWeight:'600' },
  profileBtn:  { width:'100%', padding:18, borderRadius:16, backgroundColor:'#FAFAFA', borderWidth:1, borderColor:'#ddd', alignItems:'center' },
  profileTxt:  { fontSize:16, color:'#555' },
});
