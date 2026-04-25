import React, { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

WebBrowser.maybeCompleteAuthSession();
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, StyleSheet, View, Text, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useApp } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import HomeHeader from './components/HomeHeader';
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
import NotificationsScreen from './screens/NotificationsScreen';
import MessagesScreen from './screens/MessagesScreen';
import ChatScreen from './screens/ChatScreen';
import CreatePlaceholderScreen from './screens/CreatePlaceholderScreen';
import { MessagesProvider, useMessages } from './context/MessagesContext';

function setupNotificationsSafely() {
  try {
    const Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    console.warn('Notifications init failed:', error);
  }
}

setupNotificationsSafely();

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const getHeaderOptions = (colors) => ({
  headerStyle: {
    backgroundColor: colors.headerBg,
  },
  headerTintColor: colors.headerText,
  headerTitleStyle: {
    fontWeight: 'bold',
  },
});

const AuthNavigator = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  return (
    <AuthStack.Navigator screenOptions={getHeaderOptions(colors)}>
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: t('auth.loginTitle') }} />
      <AuthStack.Screen name="Signup" component={SignupScreen} options={{ title: t('auth.signupTitle') }} />
    </AuthStack.Navigator>
  );
};

const TabNavigator = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const { notifications = [] } = useApp();
  const { unreadConversationsCount = 0 } = useMessages();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconMap = {
            Home: focused ? 'home' : 'home-outline',
            Notifications: focused ? 'notifications' : 'notifications-outline',
            Create: 'add',
            Messages: focused ? 'chatbubbles' : 'chatbubbles-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={iconMap[route.name] || 'ellipse'} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted || '#95a5a6',
        tabBarStyle: {
          backgroundColor: colors.card || '#fff',
          borderTopColor: colors.border || '#dee2e6',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: colors.headerBg,
        },
        headerTintColor: colors.headerText,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          tabBarLabel: t('tabs.home'),
          headerTitle: () => (
            <Text style={styles.headerTitle}>
              Find A <Text style={styles.headerTitleEmphasis}>Match</Text>
            </Text>
          ),
          headerTitleAlign: 'center',
          headerLeft: () => (
            <HomeHeader
              onMenuPress={() => navigation.getParent().navigate('Menu')}
            />
          ),
        })}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: t('tabs.notifications'),
          tabBarLabel: t('tabs.notifications'),
          tabBarBadge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : undefined,
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreatePlaceholderScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.getParent().navigate('Request');
          },
        })}
        options={{
          title: t('tabs.create'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add" size={size + 4} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          title: t('messages.title'),
          tabBarLabel: t('tabs.messages'),
          tabBarBadge:
            unreadConversationsCount > 0
              ? unreadConversationsCount > 9
                ? '9+'
                : unreadConversationsCount
              : undefined,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t('profile.title'),
          tabBarLabel: t('tabs.profile'),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  return (
    <AppStack.Navigator initialRouteName="MainTabs" screenOptions={getHeaderOptions(colors)}>
      <AppStack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <AppStack.Screen name="Request" component={RequestScreen} options={{ headerTitle: '' }} />
      <AppStack.Screen name="Requests" component={RequestsScreen} options={{ title: t('details.headerTitle') }} />
      <AppStack.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          title: t('menu.title'),
          headerShown: false,
        }}
      />
      <AppStack.Screen name="Friends" component={FriendsScreen} options={{ title: t('friends.title') }} />
      <AppStack.Screen name="MatchHistory" component={MatchHistoryScreen} options={{ title: t('matchHistory.title') }} />
      <AppStack.Screen name="FriendProfile" component={FriendProfileScreen} options={{ title: t('friendProfile.title') }} />
      <AppStack.Screen name="Profile" component={ProfileScreen} options={{ title: t('profile.title') }} />
      <AppStack.Screen name="Settings" component={SettingsScreen} options={{ title: t('menu.options') }} />
      <AppStack.Screen name="Account" component={AccountScreen} options={{ title: t('menu.account') }} />
      <AppStack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          title: route.params?.friendName || t('messages.chatTitle'),
        })}
      />
    </AppStack.Navigator>
  );
};

const LoadingScreen = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

const RootNavigator = () => {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!user || Platform.OS === 'web') return undefined;
    try {
      const Notifications = require('expo-notifications');
      Notifications.requestPermissionsAsync().catch(() => {});
    } catch (error) {
      console.warn('Notifications permission request failed:', error);
    }
    return undefined;
  }, [user]);

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
      <MessagesProvider>
        <AppNavigator />
      </MessagesProvider>
    </AppProvider>
  );
};

const AppWithTheme = () => {
  const { isDarkMode, colors } = useTheme();
  const navTheme = {
    ...DefaultTheme,
    dark: isDarkMode,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.warning,
    },
  };
  return (
    <NavigationContainer theme={navTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <NotificationProvider>
                <AppWithTheme />
              </NotificationProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitleEmphasis: {
    fontFamily: Platform.select({
      ios: 'Snell Roundhand',
      android: 'cursive',
      default: 'cursive',
    }),
    fontStyle: 'normal',
  },
});
