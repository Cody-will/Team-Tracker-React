import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";

admin.initializeApp();

type AuthInput = {
  email: string;
  password: string;
  ifExists?: "return" | "error";
};

// This function checks if the user is authenticated and if they are an admin user
function isAdmin(req: any) {
  if (!req.auth) throw new HttpsError("unauthenticated", "Unauthenticated");
  const token = req.auth.token as Record<string, unknown>;
  const admin = token.role === "admin" || token.admin === true;
  if (!admin) throw new HttpsError("permission-denied", "Admin only");
}

// This function creates the auth user account
export const createAuthUser = onCall(async (req) => {
  isAdmin(req);

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

// This functon deletes an auth user account
export const deleteAuthUser = onCall(async (req) => {
  isAdmin(req);

  const { uid } = req.data as { uid?: string };
  if (!uid) throw new HttpsError("invalid-argument", "uid required");
  await admin.auth().deleteUser(uid);
  return { ok: true };
});

// This function disables an auth user account so their account is still there but they cant use it
export const setDisabled = onCall(async (req) => {
  isAdmin(req);

  const { uid, disabled } = req.data as { uid?: string; disabled?: boolean };
  if (!uid || typeof disabled !== "boolean")
    throw new HttpsError("invalid-argument", "uid & disabled required");
  await admin.auth().updateUser(uid, { disabled });
  return { uid, disabled };
});

// This functions sets the users role and can give them admin access if set to admin
export const setUserRole = onCall(async (req) => {
  isAdmin(req);
  const { uid, role } = req.data as { uid?: string; role?: string };
  if (!uid || !role)
    throw new HttpsError("invalid-argument", "uid & role required");
  await admin.auth().setCustomUserClaims(uid, { role });
  return { complete: true };
});
