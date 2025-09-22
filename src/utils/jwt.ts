import jwt, { JwtPayload } from "jsonwebtoken";

export function generateToken(payload: JwtPayload) {
  const secret = process.env.JWT_SECRET || "default_secret";
  return jwt.sign(payload, secret, { expiresIn: "1d" });
}