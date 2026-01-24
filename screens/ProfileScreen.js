import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import ProfileView from '../components/ProfileView';

export default function ProfileScreen() {
  const { user, profile, updateProfileInfo } = useAuth();
  const { friends = [], requests = [] } = useApp();
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [sports, setSports] = useState([]);
  const [photoURL, setPhotoURL] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSports, setShowSports] = useState(false);
  const [showFriends, setShowFriends] = useState(false);

  useEffect(() => {
    setUsername(profile?.username || user?.displayName || '');
    setPhotoURL(profile?.photoURL || user?.photoURL || '');
    setDisplayName(profile?.displayName || user?.displayName || '');
    setBio(profile?.bio || '');
    setSports(profile?.sports || []);
  }, [profile, user]);

  const handlePickPhoto = async () => {
    if (!user?.uid) {
      Alert.alert(t('profile.title'), t('profile.uploadError'));
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('profile.title'), t('profile.permissionError'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    try {
      setUploading(true);
      const asset = result.assets[0];
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);

      setPhotoURL(downloadUrl);
      await updateProfileInfo({ username, displayName, bio, photoURL: downloadUrl });
      Alert.alert(t('profile.title'), t('profile.photoUpdated'));
    } catch (error) {
      console.error('Profile photo upload error:', error);
      const errorMessage = error?.code
        ? `${t('profile.uploadError')} (${error.code})`
        : error?.message || t('profile.uploadError');
      Alert.alert(t('profile.title'), errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfileInfo({
        username,
        displayName,
        bio,
        sports,
        photoURL,
      });
      Alert.alert(t('profile.title'), t('profile.saved'));
    } catch (error) {
      Alert.alert(t('profile.title'), error.message || t('profile.saveError'));
    } finally {
      setSaving(false);
    }
  };


  const availableSports = ['Tennis', 'Padel', 'Golf', 'Basketball'];
  const profileName = displayName || username || user?.displayName || '';
  const handleToggleSport = (sport) => {
    setSports((prev) =>
      prev.includes(sport) ? prev.filter((item) => item !== sport) : [...prev, sport]
    );
  };
  const handlePickPhotoPress = () => {
    if (saving || uploading) {
      return;
    }
    handlePickPhoto();
  };

  const matchCount = requests.filter((request) => request.status === 'completed').length;

  return (
    <SafeAreaView style={styles.container}>
      <ProfileView
        name={profileName}
        username={username}
        bio={bio}
        photoURL={photoURL}
        isEditable
        onPickPhoto={handlePickPhotoPress}
        displayNameValue={displayName}
        onChangeDisplayName={setDisplayName}
        bioValue={bio}
        onChangeBio={setBio}
        sports={sports}
        availableSports={availableSports}
        onToggleSport={handleToggleSport}
        friends={friends}
        matchCount={matchCount}
        showSports={showSports}
        onToggleSports={() => setShowSports((prev) => !prev)}
        showFriends={showFriends}
        onToggleFriends={() => setShowFriends((prev) => !prev)}
        t={t}
        footer={
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.primaryButton, saving && styles.disabledButton]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.primaryButtonText}>
                {saving ? t('profile.saving') : t('profile.save')}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  footer: {
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
