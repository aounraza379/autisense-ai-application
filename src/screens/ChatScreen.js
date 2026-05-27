import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, TextInput, ActivityIndicator
} from 'react-native';
import { ChatEngine }      from '../engine/chatEngine';
import { SpeechRecognizer } from '../engine/voice';
import { startSession, endSession, getRecentInteractions, getQueuedMessages } from '../db/database';
import EmotionBoard  from '../components/EmotionBoard';
import CoachingLabel from '../components/CoachingLabel';
import VoiceButton   from '../components/VoiceButton';
import { toBool }    from '../utils/bool';
import * as Network from 'expo-network';

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
  
  const [isOffline,  setIsOffline]  = useState(false);
  const [syncing,    setSyncing]    = useState(false);

  useEffect(() => {
    setup();
    const intervalId = setInterval(checkAndSync, 5000);
    return () => {
      clearInterval(intervalId);
      cleanup();
    };
  }, []);

  async function checkAndSync() {
    if (syncing) return;
    try {
      let netState = { isConnected: true, isInternetReachable: true };
      try {
        netState = await Network.getNetworkStateAsync();
      } catch (e) {}
      
      const offline = netState.isConnected === false || netState.isInternetReachable === false;
      setIsOffline(offline);

      if (!offline) {
        const queued = await getQueuedMessages();
        if (queued.length > 0 && engineRef.current) {
          setSyncing(true);
          setCoaching('Syncing offline messages...');
          const syncedResponses = await engineRef.current.syncQueue(queued);
          
          if (syncedResponses.length > 0) {
            setMessages(prev => {
              const newMsgs = [...prev];
              syncedResponses.forEach(res => {
                newMsgs.push({ id: Date.now() + Math.random(), role: 'assistant', content: res.aiResponse });
              });
              return newMsgs;
            });
            setTimeout(() => {
              if (flatListRef.current) flatListRef.current.scrollToEnd({ animated: true });
            }, 300);
          }
          setCoaching('Ready! Talk to me!');
          setSyncing(false);
        }
      }
    } catch (e) {
      setSyncing(false);
    }
  }

  async function setup() {
    const sessionId = await startSession(childId, role);
    sessionIdRef.current = sessionId;

    const engine = new ChatEngine(childId, sessionId, role);
    await engine.init();
    engineRef.current = engine;

    // Check Network and Sync
    let netState = { isConnected: true, isInternetReachable: true };
    try {
      netState = await Network.getNetworkStateAsync();
    } catch (e) {}
    const offline = netState.isConnected === false || netState.isInternetReachable === false;
    setIsOffline(offline);

    await loadHistory();

    if (!offline) {
      await checkAndSync();
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

  async function loadHistory() {
    try {
      const historyRows = await getRecentInteractions(childId, 20, role); 
      const loadedMessages = [];
      historyRows.reverse().forEach((row) => {
         if (row.user_text) {
           loadedMessages.push({ id: `hist-u-${row.id}`, role: 'user', content: row.user_text });
         }
         if (row.ai_response) {
           loadedMessages.push({ id: `hist-a-${row.id}`, role: 'assistant', content: row.ai_response });
         }
      });
      setMessages(loadedMessages);
      
      setTimeout(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: false });
        }
      }, 300);
    } catch (err) {
      console.log('[ChatScreen] Error loading history:', err);
    }
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

    try {
      let netState = { isConnected: true, isInternetReachable: true };
      try {
        netState = await Network.getNetworkStateAsync();
      } catch (e) {}
      
      const offline = netState.isConnected === false || netState.isInternetReachable === false;
      setIsOffline(offline);

      if (!offline && engineRef.current) {
         // pre-sync before processing current msg to maintain order
         await checkAndSync();
      }

      setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: text }]);
      setCoaching(buildCoachingTip(text));

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
  }, [processing, syncing]);

  function buildCoachingTip(text) {
    const t = text.toLowerCase();
    if (t.includes('please') || t.includes('thank you')) return 'Wonderful manners!';
    if (text.split(' ').length <= 2) return 'Good try! Can you say more?';
    if (t.includes('because')) return 'Great explaining why you feel that!';
    return 'Keep talking — you are doing great!';
  }

  return (
    <SafeAreaView style={styles.container}>
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Offline Mode: Responses will sync later.</Text>
        </View>
      )}
      {syncing && (
        <View style={styles.syncBanner}>
          <Text style={styles.syncText}>Syncing previous offline messages...</Text>
        </View>
      )}
      
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

      {toBool(processing) === true ? <ActivityIndicator size="small" color="#3F51B5" style={{ margin:8 }} accessible={true} accessibilityRole="progressbar" accessibilityLabel="AI is typing" /> : null}

      <View style={styles.inputRow}>
        <TextInput 
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type here..."
            editable={toBool(!processing) === true}
            accessible={true}
            accessibilityLabel="Message input field"
            accessibilityHint="Type your message to the AI here"
        />
        <TouchableOpacity 
            style={styles.sendBtn}
            onPress={() => {
                handleInput(inputText, 'text');
                setInputText('');
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Send message"
        >
            <Text style={styles.sendBtnTxt}>Send</Text>
        </TouchableOpacity>
      </View>

      <VoiceButton 
        listening={toBool(listening) === true} 
        disabled={toBool(processing) === true}
        onPress={() => {
            if (isOffline) {
                setCoaching('Voice input needs internet. Please type your message instead.');
                return;
            }
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
  offlineBanner: { backgroundColor: '#FFA000', padding: 8, alignItems: 'center' },
  offlineText: { color: 'white', fontWeight: 'bold' },
  syncBanner: { backgroundColor: '#3F51B5', padding: 8, alignItems: 'center' },
  syncText: { color: 'white', fontWeight: 'bold' },
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
