import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Colors} from '../utils/theme';
import HomeScreen from '../screens/HomeScreen';
import AddEventScreen from '../screens/AddEventScreen';
import ReturnsScreen from '../screens/ReturnsScreen';
import EventPreviewScreen from '../screens/EventPreviewScreen';

const Stack = createNativeStackNavigator();

export default function HomeNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: Colors.cardBg},
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: {fontWeight: '700', fontSize: 17},
        headerShadowVisible: false,
        headerBackTitle: '',
      }}>
      <Stack.Screen name="EventList" component={HomeScreen} options={{headerShown: false}} />
      <Stack.Screen name="AddEvent" component={AddEventScreen} options={{title: 'Add Event'}} />
      <Stack.Screen name="Returns" component={ReturnsScreen} options={{title: 'Returns'}} />
      <Stack.Screen name="EventPreview" component={EventPreviewScreen} options={{title: 'Preview'}} />
    </Stack.Navigator>
  );
}
