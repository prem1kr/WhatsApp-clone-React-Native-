import { 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  View, 
  ActivityIndicator 
} from 'react-native';
import React, { useRef, useState } from 'react';
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

const Register = () => {
  const nameRef = useRef("");
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const profileImageRef = useRef(""); 
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!nameRef.current || !emailRef.current || !passwordRef.current) {
      Alert.alert("Sign Up", "Please fill all the fields");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        'https://whatsapp-clone-oidq.onrender.com/api/auth/register', 
        {
          name: nameRef.current,
          email: emailRef.current,
          password: passwordRef.current,
          profileImage: profileImageRef.current || "",
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", response.data.message || "Account created successfully!");
        await connectSocket();
        router.push("/(auth)/login");
      } else {
        Alert.alert("Sign Up Failed", response.data.message || "Please try again later");
      }

    } catch (error: any) {
      console.error("Registration Error:", error.response?.data || error.message);
      Alert.alert("Sign Up", "Something went wrong, please try again later");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? "padding" : "height"}
    >
      <ScreenWrapper showPattern={true}>
        <View style={styles.container}>
          <View style={styles.header}>
            <BackButton iconSize={28} />
            <Typo size={17} color={colors.white}>Need some help?</Typo>
          </View>

          <View style={styles.content}>
            <ScrollView 
              contentContainerStyle={styles.form} 
              showsVerticalScrollIndicator={false}
            >
              <View style={{ gap: spacingY._10, marginBottom: spacingY._15 }}>
                <Typo size={28} fontWeight={"600"}>Getting Started</Typo>
                <Typo color={colors.neutral600}>Create a new Account</Typo>
              </View>

              <Input
                placeholder='Enter your name'
                onChangeText={(value) => nameRef.current = value}
                icon={<Icons.User size={verticalScale(26)} color={colors.neutral600} />}
              />

              <Input
                placeholder='Enter your email'
                onChangeText={(value) => emailRef.current = value}
                icon={<Icons.At size={verticalScale(26)} color={colors.neutral600} />}
              />

              <Input
                placeholder='Enter your password'
                secureTextEntry
                onChangeText={(value) => passwordRef.current = value}
                icon={<Icons.Lock size={verticalScale(26)} color={colors.neutral600} />}
              />

              <View style={{ marginTop: spacingY._25, gap: spacingY._15 }}>
                <Button loading={isLoading} onPress={handleSubmit}>
                  <Typo fontWeight={'bold'} color={colors.black} size={20}>Sign Up</Typo>
                </Button>

                <View style={styles.footer}>
                  <Typo>Already have an account?</Typo>
                  <Pressable onPress={() => router.push("/(auth)/login")}>
                    <Typo fontWeight={"bold"} color={colors.primaryDark}>Login</Typo>
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

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._15,
    paddingBottom: spacingY._25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: "continuous",
    paddingHorizontal: spacingX._20,
    paddingTop: spacingY._20,
  },
  form: {
    gap: spacingY._15,
    marginTop: spacingY._20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
});
