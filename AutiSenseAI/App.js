import React, { useEffect, useState } from 'react';

// GLOBAL RUNTIME GUARD FOR BOOLEAN CAST ERRORS
const originalError = console.error;
console.error = (...args) => {
  if (String(args[0]).includes('cannot be cast to java.lang.Boolean')) {
    throw new Error('BOOLEAN CAST DETECTED → TRACE ABOVE');
  }
  originalError(...args);
};
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity } from 'react-native';
import { initDatabase, createChildProfile, getSetting, setSetting } from './src/db/database';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen     from './src/screens/HomeScreen';
import ChatScreen     from './src/screens/ChatScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import ProfileScreen  from './src/screens/ProfileScreen';

const Stack = createStackNavigator();

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex:1, justifyContent:'center', alignItems:'center', padding:20 }}>
          <Text style={{ fontSize:18, fontWeight:'bold', marginBottom:12 }}>
            Something went wrong.
          </Text>
          <Text style={{ color:'#888', marginBottom:20 }}>
            {this.state.error?.message}
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false })}
            style={{ padding:14, backgroundColor:'#3F51B5', borderRadius:10 }}
          >
            <Text style={{ color:'white', fontSize:16 }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [ready,   setReady]   = useState(false);
  const [childId, setChildId] = useState(null);

  useEffect(() => { init(); }, []);

  async function init() {
    console.log('--- APP INIT START ---');
    try {
      console.log('Initializing database...');
      await initDatabase();
      console.log('Database OK.');
      
      let id = await getSetting('childId');
      if (!id) {
        console.log('No childId found, creating profile...');
        const newId = await createChildProfile('My Child', 7, 'mixed');
        await setSetting('childId', String(newId));
        id = String(newId);
        console.log('Profile created with ID:', id);
      } else {
        console.log('Existing childId found:', id);
      }
      setChildId(Number(id));
      setReady(true);
      console.log('--- APP READY ---');
    } catch (e) {
      console.error('INIT ERROR:', e);
      setReady(true);
    }
  }

  if (!ready) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <Text>Loading App...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home"     component={HomeScreen}
              initialParams={{ childId }}
              options={{ title: 'AutiSense AI' }} />
            <Stack.Screen name="Chat"     component={ChatScreen}
              options={{ title: 'Talk to Me' }} />
            <Stack.Screen name="Schedule" component={ScheduleScreen}
              options={{ title: 'My Day' }} />
            <Stack.Screen name="Profile"  component={ProfileScreen}
              options={{ title: 'Profile' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
