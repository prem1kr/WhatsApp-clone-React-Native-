import mongoose, { Schema } from "mongoose";

const ConversationSchema = new Schema({
  type: { type: String, enum: ["direct", "group"], required: true },
  name: { type: String },
  participants: [{ type: Schema.Types.ObjectId, ref: "auth", required: true }],
  lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  createdBy: { type: Schema.Types.ObjectId, ref: "auth" },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ConversationSchema.pre("save", function(next){
    this.updatedAt = new Date();
    next();
})

const conversation = mongoose.model("Conversation", ConversationSchema);
export default conversation;