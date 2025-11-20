// Avatar.tsx
import { Image, StyleSheet, View } from 'react-native';
import React from 'react';
import { AvatarProps } from '@/types';
import { verticalScale } from '@/utils/styling';
import { colors } from '@/constants/theme';

// Correct require paths (since Avatar.tsx is in /components/)
const defaultUser = require("../assets/images/defaultavatar.png");
const defaultGroup = require("../assets/images/defaultgroupavatar.png");

export const getAvatarPath = (file: any, isGroup = false) => {
  if (typeof file === "string" && file.trim() !== "") {
    return { uri: file };
  }

  if (file && typeof file === "object" && file.uri && file.uri.trim() !== "") {
    return { uri: file.uri };
  }

  return isGroup ? defaultGroup : defaultUser;
};

const Avatar = ({ uri, size = 40, style, isGroup = false }: AvatarProps) => {
  const source = getAvatarPath(uri, isGroup);

  return (
    <View
      style={[
        styles.avatar,
        {
          height: verticalScale(size),
          width: verticalScale(size),
          borderRadius: verticalScale(size) / 2,
        },
        style,
      ]}
    >
      <Image
        source={source}
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          borderRadius: verticalScale(size) / 2,
        }}
        resizeMode="cover"
      />
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  avatar: {
    alignSelf: "center",
    backgroundColor: colors.neutral200,
    borderWidth: 1,
    borderColor: colors.neutral100,
    overflow: "hidden",
  },
});
