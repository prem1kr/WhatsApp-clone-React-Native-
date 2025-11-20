import { StyleSheet, View, Image } from 'react-native';
import React from 'react';
import { MessageProps } from '@/types';
import { verticalScale } from '@/utils/styling';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import Avatar from './avatar';
import Typo from './Typo';
import moment from 'moment';

const MessageItem = ({
  item,
  isDirect,
  currentUserId
}: { item: MessageProps, isDirect: boolean, currentUserId: string }) => {

  const isMe = currentUserId === item?.sender?.id;

  const formattedDate = moment(item?.createdAt).isSame(moment(), "day")
    ? moment(item?.createdAt).format("h:mm A")
    : moment(item?.createdAt).format("MMM D, h:mm A");

  const image =
    item?.media ||
    item?.image ||
    item?.attachment ||
    item?.file ||
    item?.fileUrl ||
    item?.mediaUrl ||
    item?.url ||
    null;

  return (
    <View style={[
      styles.messageContainer,
      isMe ? styles.myMessage : styles.theirMessage
    ]}>
      
      {/* Avatar for other user */}
      {!isMe && isDirect && (
        <Avatar size={30} uri={item?.sender?.avatar} style={styles.messageAvatar} />
      )}

      <View style={[
        styles.messageBubble,
        isMe ? styles.myBubble : styles.theirBubble
      ]}>
        
        {/* Sender name for group chat */}
        {!isMe && !isDirect && (
          <Typo color={colors.neutral900} fontWeight="600" size={13}>
            {item?.sender?.name}
          </Typo>
        )}

        {/* IMAGE FIRST */}
        {image && (
          <Image
            source={{ uri: image }}
            style={styles.attachment}
            resizeMode="cover"
          />
        )}

        {/* TEXT */}
        {item?.content ? (
          <Typo size={15}>{item.content}</Typo>
        ) : null}

        {/* TIME */}
        <Typo
          style={{ alignSelf: "flex-end" }}
          size={11}
          fontWeight="500"
          color={colors.neutral600}
        >
          {formattedDate}
        </Typo>
      </View>
    </View>
  );
};

export default MessageItem;

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: "row",
    gap: spacingX._7,
    maxWidth: "80%",
    marginBottom: spacingY._5,
    marginTop: spacingY._5,
  },
  myMessage: {
    alignSelf: "flex-end",
  },
  theirMessage: {
    alignSelf: "flex-start",
  },
  messageAvatar: {
    alignSelf: "flex-end",
  },
  attachment: {
    height: verticalScale(180),
    width: verticalScale(180),
    borderRadius: radius._15,
  },
  messageBubble: {
    padding: spacingX._10,
    borderRadius: radius._15,
    gap: spacingY._5,
  },
  myBubble: {
    backgroundColor: colors.myBubble,
  },
  theirBubble: {
    backgroundColor: colors.otherBubble,
  },
});
