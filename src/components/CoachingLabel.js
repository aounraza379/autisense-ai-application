import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CoachingLabel({ text }) {
  if (!text) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { margin:12, padding:14, backgroundColor:'#EDE7F6', borderRadius:14, borderLeftWidth:4, borderLeftColor:'#7E57C2' },
  text:      { fontSize:15, fontWeight:'600', color:'#4A148C' },
});
