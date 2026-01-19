import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import BackButton from '@/components/BackButton';
import Input from '@/components/Input';
import * as Icons from 'phosphor-react-native';
import { verticalScale } from '@/utils/styling';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { connectSocket } from '@/socket/socket';

// Reusable Button with loading support
const Button = ({ children, loading, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        {
          opacity: pressed || loading ? 0.7 : 1,
          backgroundColor: colors.primaryLight,
          paddingVertical: spacingY._15,
          borderRadius: radius._15,
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.black} />
      ) : (
        children
      )}
    </Pressable>
  );
};

const Login = () => {
  const emailRef = useRef('');
  const passwordRef = useRef('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // ✅ AUTO REDIRECT IF ALREADY LOGGED IN
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        if (token) {
          router.replace('/(main)/home');
        }
      } catch (error) {
        console.log('Error checking login status:', error);
      }
    };

    checkLoginStatus();
  }, []);

  const handleSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert('Login', 'Please fill all the fields');
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post(
        'https://whatsapp-clone-oidq.onrender.com/api/auth/login',
        {
          email: emailRef.current,
          password: passwordRef.current,
        }
      );

      if (response.status === 200 && response.data.token) {
        const { message, user, token } = response.data;

        Alert.alert('Success', message);

        await AsyncStorage.setItem('userId', user._id);
        await AsyncStorage.setItem('token', token);

        await connectSocket();

        router.replace('/(main)/home');
      } else {
        Alert.alert(
          'Login Failed',
          response.data.message || 'Invalid credentials'
        );
      }
    } catch (err) {
      console.error('Login Error:', err);

      if (axios.isAxiosError(err) && err.response?.data?.message) {
        Alert.alert('Login Failed', err.response.data.message);
      } else {
        Alert.alert('Login Failed', 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenWrapper showPattern={true}>
        <View style={styles.container}>
          <View style={styles.header}>
            <BackButton iconSize={28} />
            <Typo size={17} color={colors.white}>
              Need some help?
            </Typo>
          </View>

          <View style={styles.content}>
            <ScrollView
              contentContainerStyle={styles.form}
              showsHorizontalScrollIndicator={false}
            >
              <View
                style={{
                  gap: spacingY._10,
                  marginBottom: spacingY._15,
                }}
              >
                <Typo size={28} fontWeight={'600'}>
                  Getting Started
                </Typo>
                <Typo color={colors.neutral600}>
                  Please login to continue ...
                </Typo>
              </View>

              <Input
                placeholder="Enter your email"
                onChangeText={(value) => (emailRef.current = value)}
                icon={
                  <Icons.At
                    size={verticalScale(26)}
                    color={colors.neutral600}
                  />
                }
              />

              <Input
                placeholder="Enter your password"
                secureTextEntry
                onChangeText={(value) => (passwordRef.current = value)}
                icon={
                  <Icons.LockIcon
                    size={verticalScale(26)}
                    color={colors.neutral600}
                  />
                }
              />

              <View style={{ marginTop: spacingY._25, gap: spacingY._15 }}>
                <Button loading={isLoading} onPress={handleSubmit}>
                  <Typo fontWeight={'bold'} color={colors.black} size={20}>
                    Login
                  </Typo>
                </Button>

                <View style={styles.footer}>
                  <Typo>Don't have an account</Typo>
                  <Pressable
                    onPress={() => router.push('/(auth)/register')}
                  >
                    <Typo
                      fontWeight={'bold'}
                      color={colors.primaryDark}
                    >
                      Sign Up
                    </Typo>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </ScreenWrapper>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._15,
    paddingBottom: spacingY._25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: 'continuous',
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._20,
  },
  form: {
    gap: spacingY._15,
    marginTop: spacingY._20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
});
