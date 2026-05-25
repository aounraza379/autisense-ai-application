import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { getSessionAnalytics, exportDataAsCSV } from '../db/database';
import { toBool } from '../utils/bool';

export default function AnalyticsScreen({ route }) {
  const { childId } = route.params;
  const [sessionData, setSessionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await getSessionAnalytics(childId, 7);
    setSessionData(data);
    setLoading(false);
  }

  async function handleExport() {
    try {
      const result = await exportDataAsCSV(childId);
      if (result && !result.success) {
        Alert.alert("Export Failed", result.error || "An unknown error occurred.");
      }
    } catch (error) {
      Alert.alert("Export Failed", error.message || "An error occurred during export.");
    }
  }

  if (toBool(loading)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Text style={{ marginTop: 10 }}>Loading Analytics...</Text>
      </View>
    );
  }

  const maxDuration = Math.max(...sessionData.map(d => d.avg_duration_minutes), 1);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Weekly Progress</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Average Session Duration (mins)</Text>
        {sessionData.length === 0 ? (
          <Text style={styles.empty}>No session data yet.</Text>
        ) : (
          sessionData.map(d => (
            <View key={d.session_date} style={styles.barRow}>
              <Text style={styles.dateLabel}>{d.session_date.slice(5)}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${(d.avg_duration_minutes / maxDuration) * 100}%` }]} />
              </View>
              <Text style={styles.valueLabel}>{Math.round(d.avg_duration_minutes)}m</Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
        <Text style={styles.exportTxt}>Export Data (CSV)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flexGrow: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: '#F9F9F9', borderRadius: 14, padding: 16, marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  empty: { color: '#888', fontStyle: 'italic' },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dateLabel: { width: 50, fontSize: 12, color: '#555' },
  barTrack: { flex: 1, height: 16, backgroundColor: '#E0E0E0', borderRadius: 8, marginHorizontal: 8, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#7E57C2', borderRadius: 8 },
  valueLabel: { width: 40, fontSize: 12, fontWeight: 'bold', textAlign: 'right' },
  exportBtn: { padding: 18, backgroundColor: '#3F51B5', borderRadius: 16, alignItems: 'center', marginTop: 10 },
  exportTxt: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
