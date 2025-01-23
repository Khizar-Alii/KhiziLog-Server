import { Schema } from "mongoose";
import mongoose from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      requierd: true,
      unique: true,
    },
    // email: {
    //   type: String,
    //   requierd: true,
    //   unique: true,
    // },
    password : {
      type: String,
      requierd: true,
      minLength : [6 , "Password must contain minimum 6 characters..."]
    },
    img: {
      type: String,
      default : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRewI4tonTOU-MiDbFkpGQ2MN_lMsLZCxSaBg&s"
    },
    role : {
      type : String,
      default : "user"
    },
    savedPosts: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
