import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import FriendsScreen from './screens/FriendsScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import MenuScreen from './screens/MenuScreen';
import MatchHistoryScreen from './screens/MatchHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import FriendProfileScreen from './screens/FriendProfileScreen';
import RequestScreen from './screens/RequestScreen';
import RequestsScreen from './screens/RequestsScreen';
import SettingsScreen from './screens/SettingsScreen';
import AccountScreen from './screens/AccountScreen';
import SignupScreen from './screens/SignupScreen';

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

const defaultHeaderOptions = {
  headerStyle: {
    backgroundColor: '#4CAF50',
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
};

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={defaultHeaderOptions}>
    <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign In' }} />
    <AuthStack.Screen name="Signup" component={SignupScreen} options={{ title: 'Create Account' }} />
  </AuthStack.Navigator>
);

const AppNavigator = () => (
  <AppStack.Navigator initialRouteName="Home" screenOptions={defaultHeaderOptions}>
    <AppStack.Screen
      name="Home"
      component={HomeScreen}
      options={({ navigation }) => ({
        title: 'Find A Match',
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Menu')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.headerMenuButton}
          >
            <Text style={styles.headerMenuIcon}>☰</Text>
          </TouchableOpacity>
        ),
      })}
    />
    <AppStack.Screen name="Request" component={RequestScreen} options={{ title: 'New Request' }} />
    <AppStack.Screen name="Requests" component={RequestsScreen} options={{ title: 'Request Details' }} />
    <AppStack.Screen
      name="Menu"
      component={MenuScreen}
      options={{
        title: 'Menu',
        headerShown: false,
      }}
    />
    <AppStack.Screen name="Friends" component={FriendsScreen} options={{ title: 'Friends' }} />
    <AppStack.Screen name="MatchHistory" component={MatchHistoryScreen} options={{ title: 'Match History' }} />
    <AppStack.Screen name="FriendProfile" component={FriendProfileScreen} options={{ title: 'Friend' }} />
    <AppStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    <AppStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Language' }} />
    <AppStack.Screen name="Account" component={AccountScreen} options={{ title: 'Account' }} />
  </AppStack.Navigator>
);

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#4CAF50" />
  </View>
);

const RootNavigator = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthNavigator />;
  }

  return (
    <AppProvider
      userId={user.uid}
      userEmail={user.email || ''}
      username={profile?.username || user.displayName || ''}
      displayName={profile?.displayName || user.displayName || ''}
      bio={profile?.bio || ''}
      photoURL={profile?.photoURL || user.photoURL || ''}
      sports={profile?.sports || []}
    >
      <AppNavigator />
    </AppProvider>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerMenuButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  headerMenuIcon: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
