import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import Header from '@/components/header';
import BackButton from '@/components/BackButton';
import Avatar from '@/components/avatar';
import * as ImagePicker from 'expo-image-picker';
import Input from '@/components/Input';
import Typo from '@/components/Typo';
import Button from '@/components/Button';
import { verticalScale } from '@/utils/styling';
import { getContacts, newConversation } from '@/socket/socketEvent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uploadFileToCloudinary } from '@/services/imageService';

const NewConversationModel = () => {
  const { isGroup } = useLocalSearchParams();
  const isGroupMode = isGroup === "1";
  const router = useRouter();

  const [groupAvatar, setGroupAvatar] = useState<{ uri: string } | null>(null);
  const [groupName, setGroupName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const safeContacts = Array.isArray(contacts) ? contacts : [];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setGroupAvatar(result.assets[0]);
    }
  };

  const toggleParticipant = (user: any) => {
    setSelectedParticipants((prev) => {
      if (prev.includes(user.id)) {
        return prev.filter((id) => id !== user.id);
      }
      return [...prev, user.id];
    });
  };


  useEffect(() => {
    getContacts(processGetContacts);
    newConversation(processNewConversation);
    getContacts(null);

    return () => {
      getContacts(processGetContacts, true);
      newConversation(processNewConversation, true);
    };
  }, []);

  const processGetContacts = (res: any) => {
    console.log("got contacts:", res);
    if (res && res.success && Array.isArray(res.data)) {
      setContacts(res.data);
    } else {
      setContacts([]);
    }
  };

  const processNewConversation = (res: any) => {
    console.log("new conversation:", res.data.participants);
    setLoading(false);
    if (res && res.success) {
      router.push({
        pathname: '/(main)/conversation',
        params: {
          id: res.data._id,
          name: res.data.name,
          avatar: res.data.avatar,
          type: res.data.type,
          participants: JSON.stringify(res.data.participants),
        }
      });
    } else {
      console.log("Failed to create conversation");
      Alert.alert("Error", "Failed to create conversation");
    }
  };


  const onSelectUser = async (user: any) => {
    const currentUser = await AsyncStorage.getItem('userId');
    if (!currentUser) return;

    if (isGroupMode) {
      toggleParticipant(user);
    } else {
      newConversation({
        type: "direct",
        participants: [currentUser, user.id],
      });
    }
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedParticipants.length < 2) return;
    const currentUser = await AsyncStorage.getItem('userId');

    setLoading(true);
    try {
      let avatar = null;
      if (groupAvatar) {
        const uploadResult = await uploadFileToCloudinary(
          groupAvatar, "group_avatars"
        );
        if (uploadResult.success) avatar = uploadResult.data;
      }

      newConversation({
        type: "group",
        participants: [currentUser, ...selectedParticipants], 
        name: groupName,
        avatar: avatar,
      })

    } catch (error) {
      console.log("Error creating group:", error);
      Alert.alert("Error", "Failed to create group conversation");
      setLoading(false);
    }
  };



  return (
    <ScreenWrapper isModal={true}>
      <View style={styles.container}>
        <Header
          title={isGroupMode ? "New Group" : "Select User"}
          leftIcon={<BackButton color={colors.black} />}
        />

        {isGroupMode && (
          <View style={styles.groupInfoContainer}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={pickImage}>
                <Avatar uri={groupAvatar?.uri || null} size={100} isGroup={true} />
              </TouchableOpacity>
            </View>
            <Input placeholder="Group Name" value={groupName} onChangeText={setGroupName} />
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contactList}>
          {safeContacts.length > 0 ? (
            safeContacts.map((user: any, index: number) => {
              const isSelected = selectedParticipants.includes(user.id);
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.contactRow, isSelected && styles.selectedContact]}
                  onPress={() => onSelectUser(user)}
                >
                  <Avatar size={45} uri={user.avatar} />
                  <Typo fontWeight={"500"}>{user.name}</Typo>
                  {isGroupMode && (
                    <View style={styles.selectionIndicator}>
                      <View style={[styles.checkbox, isSelected && styles.checked]} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Typo color={colors.neutral600}>No contacts available</Typo>
            </View>
          )}
        </ScrollView>

        {isGroupMode && selectedParticipants.length >= 2 && (
          <View style={styles.createGroupButton}>
            <Button onPress={createGroup} disabled={!groupName.trim()} loading={isLoading}>
              <Typo fontWeight={"bold"} size={17}>Create Group</Typo>
            </Button>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default NewConversationModel;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacingX._15,
    flex: 1,
  },
  groupInfoContainer: {
    alignItems: "center",
    marginTop: spacingY._10,
  },
  avatarContainer: {
    marginBottom: spacingY._10,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
    paddingVertical: spacingY._5,
  },
  selectedContact: {
    backgroundColor: colors.neutral100,
    borderRadius: radius._15,
  },
  contactList: {
    gap: spacingY._12,
    marginTop: spacingY._12,
    paddingTop: spacingY._10,
    paddingBottom: verticalScale(150),
  },
  selectionIndicator: {
    marginLeft: "auto",
    marginTop: spacingX._10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  checked: {
    backgroundColor: colors.primary,
  },
  createGroupButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacingX._15,
    backgroundColor: colors.white,
    borderTopColor: colors.neutral200,
  },
});
