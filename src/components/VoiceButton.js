import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { toBool } from '../utils/bool';

export default function VoiceButton({ listening, onPress, disabled }) {
  // RULE: Strict boolean coercion before JSX
  const isListening = toBool(listening);
  const isDisabled  = toBool(disabled);

  // DEBUG: Native Prop Audit
  console.log('[DEBUG] VoiceButton Native Props:', {
    disabled:  { value: isDisabled,  type: typeof isDisabled },
    listening: { value: isListening, type: typeof isListening },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled === true} // RULE: No undefined leakage
        style={[
          styles.btn, 
          // RULE: Fix conditional style arrays (ternary only)
          isListening === true ? styles.btnActive : null, 
          isDisabled === true ? styles.btnDisabled : null
        ]}
        activeOpacity={0.8}
      >
        <Text style={styles.label}>
          {isListening === true ? 'Listening... tap to stop' : 'Tap to speak'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { padding:12 },
  btn:         { flexDirection:'row', alignItems:'center', justifyContent:'center', padding:16, borderRadius:16, backgroundColor:'#3F51B5' },
  btnActive:   { backgroundColor:'#C62828' },
  btnDisabled: { backgroundColor:'#BDBDBD' },
  label:       { fontSize:16, color:'#fff', fontWeight:'600' },
});
