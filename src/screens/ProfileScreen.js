import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { getChildProfile, getEmotionFrequency, getPreferences } from '../db/database';
import { analyseChildPatterns } from '../engine/patterns';
import { toBool } from '../utils/bool';

export default function ProfileScreen({ route }) {
  const { childId } = route.params;
  const [profile,  setProfile]  = useState(null);
  const [emotions, setEmotions] = useState([]);
  const [prefs,    setPrefs]    = useState({});
  const [patterns, setPatterns] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const [p, e, pr, pat] = await Promise.all([
      getChildProfile(childId),
      getEmotionFrequency(childId, 7),
      getPreferences(childId),
      analyseChildPatterns(childId),
    ]);
    setProfile(p); setEmotions(e); setPrefs(pr); setPatterns(pat);
    setLoading(false);
  }

  if (toBool(loading) === true) return <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><ActivityIndicator size="large" color="#7E57C2" /><Text style={{marginTop: 10}}>Loading Profile...</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.name}>{profile?.name}</Text>
      <Text style={styles.sub}>Age: {profile?.age} · Level: {profile?.communication_level}</Text>

      <Section title="This Week's Emotions">
        {emotions.length === 0
          ? <Text style={styles.empty}>No data yet — keep using the app!</Text>
          : emotions.map(e => (
            <View key={e.detected_state} style={styles.row}>
              <Text style={styles.stateName}>{e.detected_state}</Text>
              <Text style={styles.stateCount}>{e.count}x</Text>
            </View>
          ))
        }
      </Section>

      <Section title="Known Preferences">
        {Object.keys(prefs).length === 0
          ? <Text style={styles.empty}>None yet — they will appear as the child speaks!</Text>
          : Object.entries(prefs).map(([k,v]) => (
            <Text key={k} style={styles.pref}>• {k}: {v}</Text>
          ))
        }
      </Section>

      <Section title="Behavioural Insights">
        {patterns.length === 0
          ? <Text style={styles.empty}>Need more sessions to detect patterns.</Text>
          : patterns.map((p,i) => (
            <View key={i} style={styles.insight}>
              <Text style={styles.insightText}>{p.insight}</Text>
              {p.action ? <Text style={styles.insightAction}>Insight: {p.action}</Text> : null}
            </View>
          ))
        }
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flexGrow:1, padding:20 },
  name:          { fontSize:26, fontWeight:'bold', textAlign:'center', marginBottom:4 },
  sub:           { fontSize:14, color:'#888', textAlign:'center', marginBottom:16 },
  section:       { backgroundColor:'#F9F9F9', borderRadius:14, padding:16, marginBottom:16 },
  sectionTitle:  { fontSize:16, fontWeight:'700', color:'#333', marginBottom:8 },
  row:           { flexDirection:'row', justifyContent:'space-between', marginBottom:4 },
  stateName:     { fontSize:15, textTransform:'capitalize' },
  stateCount:    { fontSize:15, fontWeight:'600', color:'#7E57C2' },
  pref:          { fontSize:14, color:'#555', marginBottom:4 },
  insight:       { backgroundColor:'#EDE7F6', borderRadius:10, padding:12, marginBottom:8 },
  insightText:   { fontSize:14, fontWeight:'600', marginBottom:2 },
  insightAction: { fontSize:13, color:'#555' },
  empty:         { fontSize:13, color:'#aaa', fontStyle:'italic' },
});
