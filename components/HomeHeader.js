import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';

export default function HomeHeader({ onMenuPress }) {
  const { friendRequests = [] } = useApp();
  const hasFriendBadge = friendRequests && friendRequests.length > 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onMenuPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.menuButton}
      >
        <Text style={styles.menuIcon}>☰</Text>
        {hasFriendBadge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {friendRequests.length > 9 ? '9+' : friendRequests.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  menuButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    position: 'relative',
  },
  menuIcon: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ff9800',
    borderWidth: 2,
    borderColor: '#6FD08B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
