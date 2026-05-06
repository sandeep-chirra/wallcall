import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text, View} from 'react-native';
import {Colors} from '../utils/theme';
import HomeNavigator from './HomeNavigator';
import PreviewScreen from '../screens/PreviewScreen';
import WidgetScreen from '../screens/WidgetScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function TabIcon({label, focused}: {label: string; focused: boolean}) {
  const icons: Record<string, string> = {
    Events: '📋', Preview: '📱', Widget: '🔒', Settings: '⚙️',
  };
  return (
    <View style={{alignItems: 'center', width: 60}}>
      <Text style={{fontSize: 20}}>{icons[label]}</Text>
      <Text
        numberOfLines={1}
        style={{
          fontSize: 10,
          fontWeight: focused ? '700' : '400',
          color: focused ? Colors.purple : Colors.textSecondary,
          marginTop: 2,
        }}>
        {label}
      </Text>
    </View>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: Colors.cardBg,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
        },
      }}>
      <Tab.Screen
        name="Events"
        component={HomeNavigator}
        options={{tabBarIcon: ({focused}) => <TabIcon label="Events" focused={focused} />}}
      />
      <Tab.Screen
        name="Preview"
        component={PreviewScreen}
        options={{tabBarIcon: ({focused}) => <TabIcon label="Preview" focused={focused} />}}
      />
      <Tab.Screen
        name="Widget"
        component={WidgetScreen}
        options={{tabBarIcon: ({focused}) => <TabIcon label="Widget" focused={focused} />}}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{tabBarIcon: ({focused}) => <TabIcon label="Settings" focused={focused} />}}
      />
    </Tab.Navigator>
  );
}
