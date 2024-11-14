// src/types/express.d.ts
import { IUser } from "../models/userModel";

declare global {
  namespace Express {
    interface User extends IUser {}

    interface Request {
      user?: User;
      isAuthenticated(): boolean;
      logout(callback: (err: any) => void): void;
    }
  }
}

export {};