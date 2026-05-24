import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, TextInput
} from 'react-native';
import { ChatEngine }      from '../engine/chatEngine';
import { SpeechRecognizer } from '../engine/voice';
import { startSession, endSession, getRecentInteractions } from '../db/database';
import EmotionBoard  from '../components/EmotionBoard';
import CoachingLabel from '../components/CoachingLabel';
import VoiceButton   from '../components/VoiceButton';
import { toBool }    from '../utils/bool';

export default function ChatScreen({ route }) {
  const { childId, role } = route.params;

  const engineRef    = useRef(null);
  const recognizer   = useRef(new SpeechRecognizer());
  const sessionIdRef = useRef(null);
  const flatListRef  = useRef(null);

  const [messages,   setMessages]   = useState([]);
  const [coaching,   setCoaching]   = useState('Ready! Talk to me!');
  const [listening,  setListening]  = useState(false);
  const [processing, setProcessing] = useState(false);
  const [inputText,  setInputText]  = useState('');

  useEffect(() => {
    setup();
    return () => cleanup();
  }, []);

  async function setup() {
    const sessionId = await startSession(childId, role);
    sessionIdRef.current = sessionId;

    const engine = new ChatEngine(childId, sessionId, role);
    await engine.init();
    engineRef.current = engine;

    // Load Chat History
    try {
      const historyRows = await getRecentInteractions(childId, 20); // Get last 20 interactions
      const loadedMessages = [];
      // DB returns newest first (DESC), so we reverse it to display oldest first
      historyRows.reverse().forEach((row) => {
         if (row.user_text) {
           loadedMessages.push({ id: `hist-u-${row.id}`, role: 'user', content: row.user_text });
         }
         if (row.ai_response) {
           loadedMessages.push({ id: `hist-a-${row.id}`, role: 'assistant', content: row.ai_response });
         }
      });
      setMessages(loadedMessages);
      
      // Scroll to end after a brief delay
      setTimeout(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: false });
        }
      }, 300);
    } catch (err) {
      console.log('[ChatScreen] Error loading history:', err);
    }

    // Set up voice callbacks
    recognizer.current.onResult = (text) => {
      setListening(false);
      handleInput(text, 'voice');
    };

    recognizer.current.onError = (msg) => {
      setListening(false);
      setCoaching(msg);
    };
  }

  async function cleanup() {
    if (sessionIdRef.current) {
      await endSession(sessionIdRef.current);
    }
    recognizer.current.destroy();
  }

  const handleInput = useCallback(async (text, inputType = 'text') => {
    if (!text?.trim() || toBool(processing)) return;
    setProcessing(true);

    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: text }]);
    setCoaching(buildCoachingTip(text));

    try {
      const result = await engineRef.current.process(text, inputType);
      if (result) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: result.text
        }]);
      }
    } catch (e) {
      setCoaching('Something went wrong. Please try again.');
    } finally {
      setProcessing(false);
      setTimeout(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    }
  }, [processing]);

  function buildCoachingTip(text) {
    const t = text.toLowerCase();
    if (t.includes('please') || t.includes('thank you')) return 'Wonderful manners!';
    if (text.split(' ').length <= 2) return 'Good try! Can you say more?';
    if (t.includes('because')) return 'Great explaining why you feel that!';
    return 'Keep talking — you are doing great!';
  }

  // DEBUG: Prop Audit before render
  console.log('[DEBUG] ChatScreen Render Props:', {
    processing: { value: processing, type: typeof processing },
    listening:  { value: listening,  type: typeof listening },
    childId:    { value: childId,    type: typeof childId },
    role:       { value: role,       type: typeof role },
  });

  return (
    <SafeAreaView style={styles.container}>
      <CoachingLabel text={coaching} />

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => String(item.id)}
        style={styles.chat}
        renderItem={({ item }) => (
          <View style={[
            styles.bubble, 
            item.role === 'user' ? styles.userBubble : styles.aiBubble
          ]}>
            <Text style={[
                styles.bubbleTxt, 
                item.role === 'assistant' ? styles.aiTxt : null
            ]}>
              {item.content}
            </Text>
          </View>
        )}
      />

      {toBool(processing) === true ? <Text style={{ textAlign:'center', margin:8 }}>Thinking...</Text> : null}

      <View style={styles.inputRow}>
        <TextInput 
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type here..."
            editable={toBool(!processing) === true}
        />
        <TouchableOpacity 
            style={styles.sendBtn}
            onPress={() => {
                handleInput(inputText, 'text');
                setInputText('');
            }}
        >
            <Text style={styles.sendBtnTxt}>Send</Text>
        </TouchableOpacity>
      </View>

      <VoiceButton 
        listening={toBool(listening) === true} 
        disabled={toBool(processing) === true}
        onPress={() => {
            if (toBool(listening)) {
                recognizer.current.stop();
                setListening(false);
            } else {
                recognizer.current.start();
                setListening(true);
            }
        }}
      />

      <EmotionBoard onSelect={(text) => handleInput(text, 'card')} />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { flex:1, backgroundColor:'#fff' },
  chat:       { flex:1, paddingHorizontal:12 },
  bubble:     { maxWidth:'80%', padding:12, borderRadius:16, marginVertical:4 },
  userBubble: { alignSelf:'flex-end', backgroundColor:'#DCF8C6' },
  aiBubble:   { alignSelf:'flex-start', backgroundColor:'#F0F0F0' },
  bubbleTxt:  { fontSize:16 },
  aiTxt:      { color:'#333' },
  inputRow:   { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: '#eee' },
  textInput:  { flex: 1, backgroundColor: '#f9f9f9', padding: 10, borderRadius: 10 },
  sendBtn:    { marginLeft: 10, backgroundColor: '#3F51B5', justifyContent: 'center', paddingHorizontal: 15, borderRadius: 10 },
  sendBtnTxt: { color: '#fff', fontWeight: 'bold' }
});
