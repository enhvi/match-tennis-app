import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import HomeScreen from './screens/HomeScreen';
import RequestScreen from './screens/RequestScreen';
import RequestsScreen from './screens/RequestsScreen';
import SettingsScreen from './screens/SettingsScreen';
import MenuScreen from './screens/MenuScreen';
import FriendsScreen from './screens/FriendsScreen';
import MenuButton from './components/MenuButton';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#4CAF50',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: 'Find A Match' }}
            />
            <Stack.Screen 
              name="Request" 
              component={RequestScreen}
              options={{ title: 'New Request' }}
            />
            <Stack.Screen 
              name="Requests" 
              component={RequestsScreen}
              options={{ title: 'Request Details' }}
            />
            <Stack.Screen 
              name="Menu" 
              component={MenuScreen}
              options={{ 
                title: 'Menu',
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="Friends" 
              component={FriendsScreen}
              options={{ title: 'Friends' }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{ title: 'Settings' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </LanguageProvider>
  );
}
