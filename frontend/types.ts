import { Router } from "expo-router";
import { ReactNode } from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";
import { colors, radius, spacingX, spacingY } from "./constants/theme";

export type TypoProps = {
  size?: number;
  color?: string;
  fontWeight?: TextStyle["fontWeight"];
  children: any | null;
  style?: TextStyle;
  textProps?: TextProps;
    numberOfLines?: number; 

};

export interface UserProps {
  email: string;
  name: string;
  avatar?: string | null;
  id?: string;
  // Add any additional fields from the token payload as needed
}
export interface UserDataProps {
  name: string;
  email: string;
  avatar?: any;
}

export interface InputProps extends TextInputProps {
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  inputRef?: React.RefObject<TextInput>;
  //   label?: string;
  //   error?: string;
}

export interface DecodedTokenProps {
  user: UserProps;
  exp: number;
  iat: number;
}

export type AuthContextProps = {
  token: string | null;
  user: UserProps | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    avatar?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updateToken: (token: string) => Promise<void>;
};

export type ScreenWrapperProps = {
  style?: ViewStyle;
  children: React.ReactNode;
  isModal?: boolean;
  showPattern?: boolean;
  bgOpacity?: number;
};

export type ResponseProps = {
  success: boolean;
  data?: any;
  msg?: string;
};

export interface ButtonProps extends TouchableOpacityProps {
  style?: ViewStyle;
  onPress?: () => void;
  loading?: boolean;
  children: React.ReactNode;
}

export type BackButtonProps = {
  style?: ViewStyle;
  color?: string;
  iconSize?: number;
};

export type AvatarProps = {
  size?: number;
  uri: string | null;
  style?: ViewStyle;
  isGroup?: boolean;
};

export type HeaderProps = {
  title?: string;
  style?: ViewStyle;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export type ConversationListItemProps = {
  item: ConversationProps;
  showDivider: boolean;
  isGroup?: boolean;
  router: Router;
};

export type ConversationProps = {
  _id: string;
  type: "direct" | "group";
  avatar: string | null;
  participants: {
    _id: string;
    name: string;
    avatar: string;
    email: string;
  }[];
  name?: string;
  lastMessage?: {
    _id: string;
    content: string;
    senderId: string;
    type: "text" | "image" | "file";
    attachment?: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type MessageProps = {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
  content: string;
  attachment?: string | null;
  media?: string | null;
  image?: string | null;
  file?: string | null;
  fileUrl?: string | null;
  mediaUrl?: string | null;
  url?: string | null;
  isMe?: boolean;
  createdAt: string;
};

export const styles = StyleSheet.create({
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
  tab: {
    flex: 1,
    borderRadius: radius.full,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minHeight: 50
  },
  gradientTab: {
    paddingVertical: spacingY._12,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
