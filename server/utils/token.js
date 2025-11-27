import jwt from "jsonwebtoken";
import dotevn from "dotenv";
dotevn.config();

async function encrypt(user) {
  return await jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1D" });
}
export default encrypt;
