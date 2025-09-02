import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      verifyUser: JwtPayload
    }
  }
}


