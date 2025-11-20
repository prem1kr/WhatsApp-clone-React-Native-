import authModel from "../model/auth.js";
import generateToken from "../utils/token.js";

export default function registerUserEvent(io, socket, userId) {
  // update profile event
  socket.on("updateProfile", async (data) => {
    try {
      if (!data || typeof data !== "object") {
        return socket.emit("updateProfile", {
          success: false,
          msg: "Invalid request",
        });
      }

      const updateObj = {};
      if (data.name) updateObj.name = data.name;
      if (data.avatar) updateObj.avatar = data.avatar;

      const updatedUser = await authModel.findByIdAndUpdate(
        userId,
        updateObj,
        { new: true }
      );

      if (!updatedUser) {
        return socket.emit("updateProfile", {
          success: false,
          msg: "User not found",
        });
      }

      const newToken = generateToken(updatedUser);

      socket.emit("updateProfile", {
        success: true,
        data: { token: newToken, user: updatedUser },
        msg: "Profile updated successfully",
      });

    } catch (error) {
      console.log("Error updating profile: ", error);
      socket.emit("updateProfile", {
        success: false,
        msg: "Error updating profile",
      });
    }
  });


  // get contacts event
  socket.on("getContacts", async () => {
    try {
      const currentUserId = userId || socket.data?.userId;
      if (!currentUserId) {
        socket.emit("getContacts", {
          success: false,
          msg: "Unauthorized",
        });
        return;
      }

      const users = await authModel.find(
        { _id: { $ne: currentUserId } },
        { password: 0 }
      ).lean();

      const contacts = users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
      }));

      socket.emit("getContacts", {
        success: true,
        data: contacts,
        msg: "Contacts fetched successfully",
      });
    } catch (error) {
      console.log("getContacts error", error);
      socket.emit("getContacts", {
        success: false,
        msg: "Failed to fetch contacts",
      });
    }
  });
}
