import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";

admin.initializeApp();

type AuthInput = {
  email: string;
  password: string;
  ifExists?: "return" | "error";
};

export const createAuthUser = onCall(async (req) => {
  if (!req.auth) throw Error("Unauthenticated");
  const token = req.auth.token as Record<string, unknown>;
  const isAdmin = token.role === "admin" || token.admin === true;
  if (!isAdmin) throw new Error("Permission denied");

  const {
    email,
    password,
    ifExists = "return",
  } = (req.data ?? {}) as AuthInput;

  if (!email) throw new Error("Missing email");

  try {
    const rec = await admin
      .auth()
      .createUser({ email, password: password || undefined });
    return { uid: rec.uid, created: true };
  } catch (e: any) {
    if (e.code === "auth/email-already-exists") {
      if (ifExists === "error") throw new Error("email-already-in-use");
      const existing = await admin.auth().getUserByEmail(email);
      return { uid: existing.uid, created: false };
    }
    throw e;
  }
});
