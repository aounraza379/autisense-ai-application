import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const EMOTIONS = [
  { label:'Happy',    text:'I feel happy',   color:'#FFE066', icon:'emoticon-happy-outline' },
  { label:'Sad',      text:'I feel sad',     color:'#90CAF9', icon:'emoticon-sad-outline' },
  { label:'Angry',    text:'I feel angry',   color:'#EF9A9A', icon:'emoticon-angry-outline' },
  { label:'Scared',   text:'I feel scared',  color:'#CE93D8', icon:'emoticon-frightened-outline' },
  { label:'Tired',    text:'I am tired',     color:'#A5D6A7', icon:'sleep' },
  { label:'Excited',  text:'I feel excited', color:'#FFF176', icon:'emoticon-excited-outline' },
  { label:'Hungry',   text:'I am hungry',    color:'#FFCC80', icon:'food-apple-outline' },
  { label:'Bathroom', text:'Bathroom',       color:'#80DEEA', icon:'toilet' },
  { label:'Hurt',     text:'I am hurt',      color:'#FFCDD2', icon:'bandage' },
  { label:'Yes',      text:'Yes',            color:'#A5D6A7', icon:'check-circle-outline' },
  { label:'No',       text:'No',             color:'#FFCDD2', icon:'close-circle-outline' },
];

export default function EmotionBoard({ onSelect }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>How do you feel?</Text>
      <ScrollView 
        horizontal={true} 
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.row}>
          {EMOTIONS.map(e => (
            <TouchableOpacity
              key={e.label}
              style={[
                  styles.card, 
                  { backgroundColor: e.color }
              ]}
              onPress={() => onSelect(e.text)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name={e.icon} size={32} color="#333" style={{ marginBottom: 4 }} />
              <Text style={styles.cardLabel}>{e.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { paddingVertical:8 },
  label:      { fontSize:14, fontWeight:'600', color:'#555', paddingHorizontal:12, marginBottom:6 },
  row:        { flexDirection:'row', paddingHorizontal:8 },
  card:       { width:80, height:90, borderRadius:16, alignItems:'center', justifyContent:'center', marginRight:10, borderWidth:2, borderColor:'#ddd', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  cardLabel:  { fontSize:12, fontWeight:'700', color:'#333', textAlign:'center' },
});
