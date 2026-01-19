import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { verticalScale } from '@/utils/styling';
import Typo from '@/components/Typo';
import Animated, { FadeIn } from 'react-native-reanimated';
import Button from '@/components/Button';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Welcome = () => {
  const router = useRouter();

  // ✅ Redirect if user is already logged in
  useEffect(() => {
    const checkLogin = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        router.replace('/(main)/home'); // redirect to home
      }
    };
    checkLogin();
  }, []);

  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.5}>
      <View style={styles.container}>
        <View style={{ alignItems: 'center' }}>
          <Typo color={colors.white} size={43} fontWeight={"900"}>
            PChat
          </Typo>
        </View>

        <Animated.Image
          entering={FadeIn.duration(700).springify()}
          source={require("../../assets/images/welcome.png")}
          style={styles.WelcomeImage}
          resizeMode={"contain"}
        />

        <View>
          <Typo color={colors.white} size={30} fontWeight={800}>
            Stay connected
          </Typo>
          <Typo color={colors.white} size={30} fontWeight={800}>
            with your friends
          </Typo>
          <Typo color={colors.white} size={30} fontWeight={800}>
            and family
          </Typo>
        </View>

        <Button
          style={{ backgroundColor: colors.white }}
          onPress={() => router.push('/(auth)/register')}
        >
          <Typo size={23} fontWeight={"bold"}>
            Get Started
          </Typo>
        </Button>
      </View>
    </ScreenWrapper>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacingX._20,
    marginVertical: spacingY._10,
  },
  background: {
    flex: 1,
    backgroundColor: colors.neutral900,
  },
  WelcomeImage: {
    height: verticalScale(300),
    aspectRatio: 1,
    alignSelf: "center",
  },
});
