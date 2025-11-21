import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { scale, verticalScale } from '@/utils/styling';
import ScreenWrapper from '@/components/ScreenWrapper';
import Header from '@/components/header';
import BackButton from '@/components/BackButton';
import Avatar from '@/components/avatar';
import * as Icons from 'phosphor-react-native';
import Typo from '@/components/Typo';
import Input from '@/components/Input';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { uploadFileToCloudinary } from '@/services/imageService';
import { connectSocket } from '@/socket/socket';

const ProfileModel = () => {
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const router = useRouter();

  // ----------- LOAD USER --------------
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('token');

        if (!userId || !token) return;

        const response = await axios.get(
          `https://whatsapp-clone-oidq.onrender.com/api/auth/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const user = response.data;
        console.log("USER FROM BACKEND:", user);

        setUserName(user.name ?? '');
        setUserEmail(user.email ?? '');

        // Support all avatar keys
        const avatarUrl =
          user.avatar ||
          user.avatarUrl ||
          user.profilePicture ||
          user.profile_image ||
          user.image ||
          user.photo ||
          user?.avatar?.url ||
          null;

        setImage(avatarUrl);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };

    loadUser();
  }, []);

  // ----------- SAVE PROFILE --------------
  const handleSave = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('token');

      if (!userId || !token) {
        Alert.alert("Error", "User not authenticated.");
        return;
      }

      let uploadedImageUrl = null;

      if (image && !image.startsWith("http")) {
        const uploadResponse = await uploadFileToCloudinary(
          { uri: image },
          "profile_pictures"
        );

        if (!uploadResponse.success) {
          Alert.alert("Error", "Image upload failed");
          return;
        }

        uploadedImageUrl = uploadResponse.data;
        setImage(uploadedImageUrl);
      }

      const updateData = {
        name: userName,
        avatar: uploadedImageUrl || image,
      };

      await axios.put(
        `https://whatsapp-clone-oidq.onrender.com/api/auth/user/${userId}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const socket = await connectSocket();
      socket.emit("updateProfile", updateData);

      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // ----------- PICK IMAGE --------------
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // ----------- SIGN OUT --------------
  const handleSignOut = async () => {
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('token');
    router.replace('/(auth)/login');
  };

  return (
    <ScreenWrapper isModal={true}>
      <View style={styles.container}>
        <Header
          title="Update profile"
          leftIcon={
            Platform.OS === 'android' && (
              <BackButton color={colors.black} style={undefined} />
            )
          }
          style={{ marginVertical: spacingY._15 }}
        />

        <ScrollView contentContainerStyle={styles.form}>
          <View style={styles.avatarContainer}>
            <Avatar uri={image} size={170} />
            <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
              <Icons.PencilIcon size={verticalScale(20)} color={colors.neutral800} />
            </TouchableOpacity>
          </View>

          <View style={{ gap: spacingY._20 }}>
            <View style={styles.inputContainer}>
              <Typo style={{ paddingLeft: spacingX._10 }}>Email</Typo>
              <Input
                value={userEmail}
                editable={false}
                containerStyle={{
                  borderColor: colors.neutral350,
                  paddingLeft: spacingX._20,
                  backgroundColor: colors.neutral300,
                }}
              />
            </View>
          </View>

          <View style={{ gap: spacingY._20 }}>
            <View style={styles.inputContainer}>
              <Typo style={{ paddingLeft: spacingX._10 }}>Name</Typo>
              <Input
                value={userName}
                onChangeText={(value) => setUserName(value)}
                placeholder="Enter your name"
                containerStyle={{ paddingLeft: spacingX._20 }}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, loading && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={{
                backgroundColor: colors.rose,
                height: verticalScale(56),
                width: verticalScale(56),
                borderRadius: verticalScale(28),
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={handleSignOut}
            >
              <Icons.SignOutIcon size={verticalScale(30)} color={colors.white} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default ProfileModel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacingY._20,
  },
  form: {
    gap: spacingY._30,
    marginTop: spacingY._15,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center',
  },
  editIcon: {
    position: 'absolute',
    bottom: spacingY._5,
    right: spacingY._7,
    borderRadius: 100,
    backgroundColor: colors.neutral100,
    shadowColor: colors.black,
    shadowOpacity: 0.25,
    elevation: 4,
    padding: spacingY._7,
  },
  inputContainer: {
    gap: spacingY._7,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.rose,
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(30),
    borderRadius: verticalScale(25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: scale(16),
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    borderTopColor: colors.neutral200,
    borderTopWidth: 1,
    marginBottom: spacingY._10,
  },
});
