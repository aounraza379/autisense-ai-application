import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const EMOTIONS = [
  { label:'Happy',    text:'I feel happy',   color:'#FFE066' },
  { label:'Sad',      text:'I feel sad',      color:'#90CAF9' },
  { label:'Angry',    text:'I feel angry',    color:'#EF9A9A' },
  { label:'Scared',   text:'I feel scared',   color:'#CE93D8' },
  { label:'Tired',    text:'I am tired',      color:'#A5D6A7' },
  { label:'Excited',  text:'I feel excited',  color:'#FFF176' },
  { label:'Hungry',   text:'I am hungry',     color:'#FFCC80' },
  { label:'Bathroom', text:'Bathroom',        color:'#80DEEA' },
  { label:'Hurt',     text:'I am hurt',       color:'#FFCDD2' },
  { label:'Yes',      text:'Yes',             color:'#A5D6A7' },
  { label:'No',       text:'No',              color:'#FFCDD2' },
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
  card:       { width:72, height:80, borderRadius:14, alignItems:'center', justifyContent:'center', marginRight:8, borderWidth:2, borderColor:'#ddd' },
  cardLabel:  { fontSize:11, fontWeight:'600', color:'#333', textAlign:'center' },
});
