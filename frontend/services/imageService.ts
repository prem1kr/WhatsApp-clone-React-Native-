import axios from "axios";
import { Platform } from "react-native";
import { CLOUDINARY_API_URL, CLOUDINARY_UPLOAD_PRESET } from "@/constants/intex";

export const uploadFileToCloudinary = async (file: { uri: string }, folderName: string) => {
  try {
    if (!file?.uri) throw new Error("Invalid file URI");

    const uri = file.uri;
    const formData = new FormData();

    // Fix 1: Use correct file type and ensure proper blob metadata
    const fileExtension = uri.split(".").pop();
    const fileName = uri.split("/").pop() || `upload.${fileExtension || "jpg"}`;
    const mimeType = `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`;

    formData.append("file", {
      uri,
      name: fileName,
      type: mimeType,
    } as any);

    // Fix 2: Append upload preset and folder
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", folderName);

    // Fix 3: iOS requires manual content-type for multipart
    const response = await axios.post(CLOUDINARY_API_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ Upload success:", response.data.secure_url);
    return { success: true, data: response.data.secure_url };
  } catch (error: any) {
    console.error("❌ Cloudinary Upload Error:", error.response?.data || error.message);
    return { success: false, msg: error.response?.data?.error?.message || error.message };
  }
};




export const getAvatarPath = (file: any, isGroup = false) => {
  if (file && typeof file === "string") {
    return { uri: file };
  }
  if (file && typeof file === "object" && file.uri) {
    return { uri: file.uri };
  }
  if (isGroup) return require("../assets/images/defaultgroupavatar.png");
  return require("../assets/images/defaultavatar.png");
};
