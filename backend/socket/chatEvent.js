import Conversation from "../model/conversation.js";
import Message from "../model/message.js";

/**
 * Register all chat-related socket.io events
 */
export function registerChatEvents(io, socket) {
  /**
   * 🟢 Get all conversations for a user
   */
  socket.on("getConversations", async () => {
    // console.log("📩 getConversations event");

    try {
      const userId = socket.data?.userId;

      if (!userId) {
        socket.emit("getConversations", {
          success: false,
          msg: "Unauthorized",
        });
        return;
      }

      const conversations = await Conversation.find({ participants: userId })
        .sort({ updatedAt: -1 })
        .populate({
          path: "lastMessage",
          select: "content senderId attachment createdAt",
        })
        .populate({ path: "participants", select: "name avatar email" })
        .lean();

      socket.emit("getConversations", {
        success: true,
        data: conversations,
      });
    } catch (error) {
      console.error("❌ getConversations error:", error);
      socket.emit("getConversations", {
        success: false,
        msg: "Failed to fetch conversations",
      });
    }
  });

  /**
   * 🟢 Create new conversation (direct or group)
   */
  socket.on("newConversation", async (data) => {
    // console.log("💬 newConversation event:", data);

    try {
      let conversationInstance;

      if (data.type === "direct") {
        // Check if direct chat already exists
        const existingConversation = await Conversation.findOne({
          type: "direct",
          participants: { $all: data.participants, $size: 2 },
        })
          .populate({ path: "participants", select: "name avatar email" })
          .lean();

        if (existingConversation) {
          socket.emit("newConversation", {
            success: true,
            data: { ...existingConversation, isNew: false },
          });
          return;
        }

        conversationInstance = new Conversation({
          type: "direct",
          participants: data.participants,
        });
        await conversationInstance.save();
      } else if (data.type === "group") {
        if (
          !data.name ||
          !Array.isArray(data.participants) ||
          data.participants.length < 3
        ) {
          socket.emit("newConversation", {
            success: false,
            msg: "Invalid group data — must include name and at least 3 participants",
          });
          return;
        }

        conversationInstance = new Conversation({
          type: "group",
          name: data.name,
          avatar: data.avatar || null,
          participants: data.participants,
          createdBy: data.participants[0],
        });

        await conversationInstance.save();
      } else {
        socket.emit("newConversation", {
          success: false,
          msg: "Unsupported conversation type",
        });
        return;
      }

      // Join sockets to this new conversation room
      const conversationSockets = Array.from(io.sockets.sockets.values()).filter(
        (s) => data.participants.includes(s.data?.userId)
      );

      for (const participantSocket of conversationSockets) {
        await participantSocket.join(conversationInstance._id.toString());
      }

      const populatedConversation = await Conversation.findById(
        conversationInstance._id
      )
        .populate({ path: "participants", select: "name avatar email" })
        .lean();

      if (!populatedConversation)
        throw new Error("Failed to populate conversation");

      io.to(conversationInstance._id.toString()).emit("newConversation", {
        success: true,
        data: { ...populatedConversation, isNew: true },
      });
    } catch (error) {
      console.error("❌ newConversation error:", error);
      socket.emit("newConversation", {
        success: false,
        msg: "Failed to create conversation",
      });
    }
  });

  /**
   * 🟢 Send new message
   */
  socket.on("newMessage", async (data) => {
    // console.log("📨 newMessage event:", data);

    try {
      if (!data.conversationId || !data.sender?.id) {
        socket.emit("newMessage", {
          success: false,
          msg: "Missing conversationId or sender info",
        });
        return;
      }

      // Save new message
      const message = await Message.create({
        conversationId: data.conversationId,
        senderId: data.sender.id,
        content: data.content,
        attachment: data.attachment || null,
      });

      // Emit to everyone in that conversation
      io.to(data.conversationId).emit("newMessage", {
        success: true,
        data: {
          id: message._id,
          content: message.content,
          sender: {
            id: data.sender.id,
            name: data.sender.name,
            avatar: data.sender.avatar,
          },
          attachment: data.attachment || null,
          createdAt: message.createdAt,
          conversationId: data.conversationId,
        },
      });

      // Update conversation’s last message + timestamp
      await Conversation.findByIdAndUpdate(data.conversationId, {
        lastMessage: message._id,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("❌ newMessage error:", error);
      socket.emit("newMessage", {
        success: false,
        msg: "Failed to send message",
      });
    }
  });

  /**
   * 🟢 Get all messages in a conversation
   */
  socket.on("getMessages", async ({ conversationId }) => {
    // console.log("🗂 getMessages event:", conversationId);

    try {
      if (!conversationId) {
        socket.emit("getMessages", {
          success: false,
          msg: "Missing conversationId",
        });
        return;
      }

      const messages = await Message.find({ conversationId })
        .populate({ path: "senderId", select: "name avatar" })
        .sort({ createdAt: 1 })
        .lean();

      const formatted = messages.map((m) => ({
        id: m._id,
        content: m.content,
        sender: {
          id: m.senderId._id,
          name: m.senderId.name,
          avatar: m.senderId.avatar,
        },
        attachment: m.attachment,
        createdAt: m.createdAt,
        conversationId: m.conversationId,
      }));

      socket.emit("getMessages", {
        success: true,
        data: formatted,
      });
    } catch (error) {
      console.error("❌ getMessages error:", error);
      socket.emit("getMessages", {
        success: false,
        msg: "Failed to retrieve messages",
      });
    }
  });
}
