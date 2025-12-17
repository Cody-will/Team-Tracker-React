import * as admin from "firebase-admin";
import {
  onCall,
  HttpsError,
  CallableRequest,
} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import nodemailer from "nodemailer";
admin.initializeApp();
import {fillBookingPdfBytes, fillIdDataPdfBytes, ServerUser} from "./pdf/fillIdDataPdf";

type AuthInput = {
  email: string;
  password: string;
  ifExists?: "return" | "error";
};

const SMTP_USER = defineSecret("SMTP_USER");
const SMTP_PASS = defineSecret("SMTP_PASS");

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
export const sendBookingPacket = onCall(
  {
    region: "us-central1",
    // Callable functions are NOT meant to be hit via fetch() from browsers.
    // This cors option is fine, but the real fix is calling via httpsCallable.
    cors: [
      "https://teamtrackerpickens.web.app",
      "https://teamtrackerpickens.firebaseapp.com",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    secrets: [SMTP_USER, SMTP_PASS],
  },
  async (req) => {
    // ✅ Prevent becoming an open mail relay
    if (!req.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }

    const { emails, formData, u } = (req.data ?? {}) as {
      emails?: string[];
      formData?: any;
      u?: ServerUser;
    };

    if (!Array.isArray(emails) || emails.length === 0) {
      throw new HttpsError("invalid-argument", "Missing emails[]");
    }

    const cleaned = [...new Set(emails.map(e => String(e).trim().toLowerCase()))];
    if (cleaned.some((e) => !isEmail(e))) {
      throw new HttpsError("invalid-argument", "One or more emails are invalid.");
    }
    if (cleaned.length > 10) {
      throw new HttpsError("invalid-argument", "Too many recipients.");
    }

    if (!formData) {
      throw new HttpsError("invalid-argument", "Missing formData");
    }
    if (!u) {
      throw new HttpsError("invalid-argument", "Missing user data (u)");
    }

    // Generate PDFs (Uint8Array or Buffer both fine)
    const bookingPdf = await fillBookingPdfBytes(formData, u);
    const idDataPdf = await fillIdDataPdfBytes(formData, u);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: SMTP_USER.value(),
        pass: SMTP_PASS.value(),
      },
    });

    // Optional but useful: fail early if SMTP creds are wrong
    await transporter.verify();

    await transporter.sendMail({
      from: `Booking Forms <${SMTP_USER.value()}>`,
      to: cleaned.join(","),
      subject: `Pre-Booking Forms ${formData.lastName}, ${formData.firstName}`,
      text: "Attached are the completed forms.",
      attachments: [
        {
          filename: "PreBook.pdf",
          content: Buffer.isBuffer(bookingPdf) ? bookingPdf : Buffer.from(bookingPdf),
          contentType: "application/pdf",
        },
        {
          filename: "IDData.pdf",
          content: Buffer.isBuffer(idDataPdf) ? idDataPdf : Buffer.from(idDataPdf),
          contentType: "application/pdf",
        },
      ],
    });

    return { ok: true, sentTo: cleaned.length };
  }
);


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
export const setUserRole = onCall(async (req: CallableRequest) => {
  // 1) Auth / permission check
  isAdmin(req);

  // 2) Validate input
  const { uid, role } = req.data as { uid?: string; role?: string };

  if (!uid || typeof uid !== "string") {
    throw new HttpsError(
      "invalid-argument",
      "A valid 'uid' string is required."
    );
  }

  if (!role || typeof role !== "string") {
    throw new HttpsError(
      "invalid-argument",
      "A valid 'role' string is required."
    );
  }

  try {
    // 3) Set custom claim
    await admin.auth().setCustomUserClaims(uid, { role });

    // 4) Optional: force token refresh on next client sign-in / refresh
    // await admin.auth().revokeRefreshTokens(uid);

    // 5) Response to client (what you'll see in res.data on the frontend)
    return { complete: true, uid, role };
  } catch (err: any) {
    console.error("setUserRole failed:", err);

    // Wrap as internal error so the client gets a clean error code/message
    throw new HttpsError(
      "internal",
      "Failed to set user role. Please try again later.",
      {
        uid,
        role,
        originalCode: err.code,
        originalMessage: err.message,
      }
    );
  }
});
