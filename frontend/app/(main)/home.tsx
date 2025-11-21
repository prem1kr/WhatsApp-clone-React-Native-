import {
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import Typo from '@/components/Typo';
import * as Icons from 'phosphor-react-native';
import { verticalScale } from '@/utils/styling';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import ConversationItem from '@/components/ConversationItem';
import Loading from '@/components/Loading';
import { connectSocket, getSocket } from '@/socket/socket';
import { getConversations, newConversation } from '@/socket/socketEvent';
import { ConversationProps, ResponseProps } from '@/types';

const Home = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [selectTab, setSelectTab] = useState(0);
  const router = useRouter();
  const tabs = ['Direct Messages', 'Group'];
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<ConversationProps[]>([]);

  let directConversations = conversations
    .filter((item) => item.type === 'direct')
    .sort((a, b) => {
      const aDate = a?.lastMessage?.createdAt || a.createdAt;
      const bDate = b?.lastMessage?.createdAt || b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

  let groupConversations = conversations
    .filter((item) => item.type === 'group')
    .sort((a, b) => {
      const aDate = a?.lastMessage?.createdAt || a.createdAt;
      const bDate = b?.lastMessage?.createdAt || b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

  const fetchUserProfile = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('token');
      if (!userId || !token) return;
      const response = await axios.get(
        `https://whatsapp-clone-oidq.onrender.com/api/auth/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserName(response.data.name);
    } catch (error) {
      console.error('Failed to load user from backend:', error);
    }
  }, []);

  // Initial load on mount
 useFocusEffect(
  useCallback(() => {
    fetchUserProfile();
  }, [fetchUserProfile])
);

  // Socket listener for profile updates
  useEffect(() => {
    const handleUpdateProfile = (data: { newName?: string }) => {
      if (data.newName) {
        console.log('Profile update received via socket:', data.newName);
        setUserName(data.newName);
      }
    };

    const setupSocket = async () => {
      await connectSocket();
      const socket = getSocket();
      if (socket) {
        socket.on('updateProfile', handleUpdateProfile);
      }
    };

    setupSocket();

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('updateProfile', handleUpdateProfile);
      }
    };
  }, []);

  useEffect(() => {
    getConversations(processConversations);
    newConversation(newConversationHandler);
    getConversations(null);
    return () => {
      getConversations(processConversations, true);
      newConversation(newConversationHandler, true);
    };
  });

  const processConversations = (res: ResponseProps) => {
    if (res?.success && Array.isArray(res.data)) {
      setConversations(res.data);
    } else {
      console.warn('Failed to process conversations:', res);
    }
  };

  const newConversationHandler = (res: ResponseProps) => {
    if (res.success && res.data?.isNew) {
      setConversations((prev) => [...prev, res.data]);
    }
  };

  return (
    <ScreenWrapper showPattern bgOpacity={0.4}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Typo color={colors.neutral200} size={19} numberOfLines={1}>
              Welcome back,{' '}
              <Typo size={20} color={colors.white} fontWeight="800">
                {userName}
              </Typo>
            </Typo>
          </View>
          <TouchableWithoutFeedback onPress={() => router.push('/(main)/profileModel')}>
            <View style={styles.settingIcon}>
              <Icons.GearSixIcon color={colors.white} weight="fill" size={verticalScale(22)} />
            </View>
          </TouchableWithoutFeedback>
        </View>

        {/* Tabs */}
        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: spacingY._20 }}>
            <View style={styles.navBar}>
              {tabs.map((tab, index) => {
                const isActive = selectTab === index;
                const scaleAnim = useRef(new Animated.Value(1)).current;
                const opacityAnim = useRef(new Animated.Value(isActive ? 1 : 0.7)).current;

                const handlePress = () => {
                  Animated.parallel([
                    Animated.sequence([
                      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
                      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
                    ]),
                    Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                  ]).start();
                  setSelectTab(index);
                };

                return (
                  <TouchableWithoutFeedback key={index} onPress={handlePress}>
                    <Animated.View
                      style={[
                        styles.tabWrapper,
                        {
                          transform: [{ scale: scaleAnim }],
                          opacity: opacityAnim,
                          shadowColor: isActive ? colors.primary : '#000',
                          shadowOpacity: isActive ? 0.25 : 0.1,
                          shadowRadius: isActive ? 8 : 3,
                          elevation: isActive ? 5 : 0,
                        },
                      ]}
                    >
                      {isActive ? (
                        <LinearGradient
                          colors={['#FFD54F', '#FFB300']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.activeGradient}
                        >
                          <Typo color={colors.white} fontWeight="700" size={15}>
                            {tab}
                          </Typo>
                        </LinearGradient>
                      ) : (
                        <View style={styles.inactiveTab}>
                          <Typo color={colors.neutral700} size={15}>
                            {tab}
                          </Typo>
                        </View>
                      )}
                    </Animated.View>
                  </TouchableWithoutFeedback>
                );
              })}
            </View>

            <View style={styles.conversationList}>
              {selectTab === 0 &&
                directConversations.map((item: ConversationProps, index) => (
                  <ConversationItem
                    key={index}
                    item={item}
                    router={router}
                    showDivider={directConversations.length !== index + 1}
                  />
                ))}
              {selectTab === 1 &&
                groupConversations.map((item, index) => (
                  <ConversationItem
                    key={index}
                    item={item}
                    router={router}
                    showDivider={groupConversations.length !== index + 1}
                  />
                ))}
            </View>

            {!loading && selectTab === 0 && directConversations.length === 0 && (
              <Typo style={{ textAlign: 'center' }}>you don't have any messages</Typo>
            )}
            {!loading && selectTab === 1 && groupConversations.length === 0 && (
              <Typo style={{ textAlign: 'center' }}>you don't have any messages</Typo>
            )}
            {loading && <Loading />}
          </ScrollView>
        </View>
      </View>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() =>
          router.push({
            pathname: '/(main)/newConversationModel',
            params: { isGroup: selectTab },
          })
        }
      >
        <Icons.PlusIcon color="#fff" weight="bold" size={verticalScale(26)} />
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacingX._20,
    gap: spacingY._20,
    paddingTop: spacingY._15,
    paddingBottom: spacingY._20,
  },
  settingIcon: {
    padding: spacingY._10,
    backgroundColor: colors.neutral700,
    borderRadius: radius.full,
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: 'continuous',
    overflow: 'hidden',
    paddingHorizontal: spacingX._20,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: spacingX._10,
    gap: spacingX._10,
  },
  tabWrapper: {
    flex: 1,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  activeGradient: {
    paddingVertical: spacingY._12,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD54F',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  inactiveTab: {
    paddingVertical: spacingY._12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.full,
    backgroundColor: '#f4f4f4',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  conversationList: {
    paddingVertical: spacingY._20,
  },
  floatingButton: {
    position: 'absolute',
    bottom: verticalScale(25),
    right: verticalScale(25),
    backgroundColor: '#25D366',
    width: verticalScale(60),
    height: verticalScale(60),
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
    elevation: 6,
  },
});
