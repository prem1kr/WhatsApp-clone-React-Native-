import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { useLocalSearchParams } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import Header from '@/components/header'
import BackButton from '@/components/BackButton'
import Avatar from '@/components/avatar'
import * as Icons from 'phosphor-react-native';
import MessageItem from '@/components/MessageItem'
import Input from '@/components/Input'
import * as ImagePicker from 'expo-image-picker';
import Loading from '@/components/Loading'
import { uploadFileToCloudinary } from '@/services/imageService'
import { getMessages, newMessage } from '@/socket/socketEvent'
import { MessageProps, ResponseProps } from '@/types'


const conversation = () => {

  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [currentUser, setCurrentUser] = useState({
    id: null as string | null,
    name: '',
    avatar: null as string | null
  });

  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('userId').then(id => setCurrentUserId(id || ''));
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = await AsyncStorage.getItem('userId');
      const userName = await AsyncStorage.getItem('userName');
      const userAvatar = await AsyncStorage.getItem('userAvatar');
      setCurrentUser({
        id: userId,
        name: userName || '',
        avatar: userAvatar || null
      });
    };
    fetchUser();
  }, []);

  const {
    id: conversationId,
    name,
    participants: stringifydParticipants,
    avatar,
    type,
  } = useLocalSearchParams();

  const participants = JSON.parse(stringifydParticipants as string);

  let isDirect = type === 'direct';
  let conversationAvatar = avatar;

  let otherParticipant = isDirect
    ? participants.find((p: any) => p._id !== currentUserId)
    : null;

  if (isDirect && otherParticipant) {
    conversationAvatar = otherParticipant.avatar;
  }

  // PREVENT undefined issues
  let conversationName =
    isDirect && otherParticipant?.name
      ? otherParticipant.name
      : name || "";


  // Pick Image/File
  const onPickFile = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setSelectedFile(result.assets[0].uri);
    }
  };


  // Socket listeners
  useEffect(() => {
    newMessage(newMessageHandler);
    getMessages(messageHandler);
    getMessages({ conversationId });

    return () => {
      newMessage(newMessageHandler, true);
      getMessages(messageHandler, true);
    }
  }, []);


  const newMessageHandler = (res: ResponseProps) => {
    setLoading(false);
    if (res.success) {
      if (res.data.conversationId === conversationId) {
        setMessages(prev => [...prev, res.data as MessageProps]);
      }
    } else {
      Alert.alert("Error", "Failed to send message. Please try again.");
    }
  }

  const messageHandler = (res: ResponseProps) => {
    if (res.success) {
      setMessages(res.data);
    } else {
      console.log("Failed to fetch messages: ", res.data);
    }
  }


  const onSend = async () => {
    if (!message.trim() && !selectedFile) return;
    if (!currentUserId) return;

    setLoading(true);

    try {
      let attachment = null;

      if (selectedFile) {
        const uploadResult = await uploadFileToCloudinary(
          { uri: selectedFile },
          "message_attachment"
        );

        if (uploadResult.success) {
          attachment = uploadResult.data;
        } else {
          Alert.alert("Error", "Failed to upload attachment.");
          setLoading(false);
          return;
        }
      }

      await newMessage({
        conversationId,
        sender: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
        },
        content: message.trim(),
        attachment,
      });

      setMessage('');
      setSelectedFile(null);

    } catch (error) {
      console.log("Error sending message: ", error);
      Alert.alert("Error", "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.5}>
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        style={styles.container}
      >

        {/* FIXED HEADER */}
        <Header
          style={styles.header}
          leftIcon={
            <View style={styles.headerLeft}>
              <BackButton style={styles.back} />
              <Avatar
                size={40}
                uri={conversationAvatar as string}
                isGroup={type == 'group'}
              />

              {conversationName ? (
                <Typo color={colors.white} fontWeight="500" size={22}>
                  {conversationName}
                </Typo>
              ) : null}
            </View>
          }
          rightIcon={
            <TouchableOpacity style={{ marginBottom: verticalScale(7) }}>
              <Icons.DotsThreeOutlineVertical
                weight="fill"
                color={colors.white}
              />
            </TouchableOpacity>
          }
        />


        <View style={styles.content}>

          <FlatList
            data={messages}
            renderItem={({ item }) => (
              <MessageItem
                item={item}
                isDirect={isDirect}
                currentUserId={currentUserId}
              />
            )}
          />


          {/* FOOTER INPUT */}
          <View style={styles.footer}>
            <Input
              value={message}
              onChangeText={setMessage}
              containerStyle={{
                paddingLeft: spacingX._10,
                paddingRight: scale(65),
                borderWidth: 0,
              }}
              placeholder="Type your messages"
              icon={
                <TouchableOpacity style={styles.inputIcon} onPress={onPickFile}>
                  <Icons.Plus weight="fill" color={colors.black} />

                  {selectedFile && (
                    <Image
                      source={{ uri: selectedFile }}
                      style={styles.selectedFile}
                    />
                  )}
                </TouchableOpacity>
              }
            />

            <View style={styles.inputRightIcon}>
              <TouchableOpacity style={styles.PlusIcon} onPress={onSend}>
                {loading ? (
                  <Loading size="small" color={colors.black} />
                ) : (
                  <Icons.PaperPlaneTilt
                    weight="fill"
                    color={colors.black}
                    size={verticalScale(22)}
                  />
                )}
              </TouchableOpacity>
            </View>

          </View>
        </View>

      </KeyboardAvoidingView>
    </ScreenWrapper>
  )
}

export default conversation



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacingX._15,
    paddingTop: spacingY._10,
    paddingBottom: spacingY._15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._12,
  },
  inputRightIcon: {
    position: 'absolute',
    right: scale(10),
    top: verticalScale(15),
    paddingLeft: spacingX._12,
    borderLeftWidth: 1.5,
    borderLeftColor: colors.neutral300,
  },
  selectedFile: {
    position: 'absolute',
    height: verticalScale(38),
    width: verticalScale(38),
    borderRadius: radius.full,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopRightRadius: radius._50,
    borderTopLeftRadius: radius._50,
    borderCurve: "continuous",
    overflow: "hidden",
    paddingHorizontal: spacingX._15,
  },
  inputIcon: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    padding: 8,
  },
  footer: {
    paddingTop: spacingY._7,
    paddingBottom: verticalScale(22),
  },
  PlusIcon: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    padding: 8,
  },
  back: {
    padding: 0
  }
})
