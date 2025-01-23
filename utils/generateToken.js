// res.cookie("jwt", token, {
//   maxAge: 7 * 24 * 60 * 60 * 1000, //milliseconds for 7 dayz
//   httpOnly: true, // prevents XSS attact corss-site scripting attacks
//   samesite: "strict", // CSRF Attacks cross-site request forgery attacks
//   secure: process.env.NODE_ENV !== "development",
// });
import jwt  from "jsonwebtoken"

const generateToken = async (userId) => {
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    // console.log(token);
    return token;

  } catch (error) {
    console.log("Error while creating the token : ", error);
    throw new Error("Error while creating the token");
  }
};
export default generateToken;
