import { useAuth } from "./context/AuthContext.jsx";
import React, { useState, useEffect, SetStateAction } from "react";
import Button from "../components/Button.jsx";
import { useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import PopUp from "../components/PopUp.tsx";
import type { PopUpProps } from "../components/PopUp.tsx";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";

interface CustomError extends Error {
  code: string;
}

type LogInFormProps = {
  handleLogin: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  email: string;
  setEmail: React.Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<SetStateAction<string>>;
  loading: boolean;
  setReset: React.Dispatch<SetStateAction<boolean>>;
};

type ResetProps = {
  email: string;
  setEmail: React.Dispatch<SetStateAction<string>>;
  setReset: React.Dispatch<SetStateAction<boolean>>;
  createPopUp: ({ title, message, location, timer }: NotifyProps) => void;
};

type NotifyProps = Omit<PopUpProps, "onClose">;

export default function Login() {
  const { signIn, currentUser, setForceSplash } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isReset, setReset] = useState(false);
  const [notify, setNotify] = useState<NotifyProps | null>(null);
  const navigate = useNavigate();

  const inputStyle =
    "border-2 border-zinc-500 w-full text-zinc-200 bg-zinc-900 rounded-lg py-2 px-3 focus:border-[var(--accent)] focus:outline-none focus:ring-2 [--tw-ring-color:var(--accent)] focus:shadow-[0_0_15px_2px_var(--accent)]";

  function createErrorPopUp({
    title,
    message,
    location,
    timer,
  }: NotifyProps): void {
    setNotify({ title, message, location, timer });
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);

      setForceSplash(true);

      setTimeout(() => {
        navigate("/home");
      }, 800);
    } catch (error: any) {
      if (error?.code === "USER_NOT_FOUND") {
        setNotify({
          title: "User Not Found",
          message:
            "Check for correct spelling in email, or contact your supervisor",
          location: "top-center",
          timer: 3,
        });
      } else if (error instanceof Error) {
        createErrorPopUp({
          title: "Uh oh!",
          message: error.message,
          location: "top-center",
          timer: 3,
        });
      } else {
        createErrorPopUp({
          title: "Uh Oh!",
          message: "Something went wrong while logging in.",
          location: "top-center",
          timer: 3,
        });
      }
    } finally {
      setLoading(false);
    }
  }

  function closePopup() {
    setNotify(null);
  }

  return (
    <>
      <motion.div
        layout
        className="relative w-full flex items-center bg-[url('./assets/default4.webp')] bg-no-repeat bg-center bg-cover justify-center h-dvh"
      >
        {notify && (
          <PopUp
            title={notify.title}
            message={notify.message}
            location={notify.location}
            onClose={closePopup}
            timer={notify.timer}
          />
        )}
        <motion.div
          id="panel"
          layout
          className="bg-zinc-950/30 flex w-full lg:max-w-1/5 max-w-8/10 font-semibold overflow-hidden drop-shadow-xl drop-shadow-zinc-950/30 p-4 rounded-xl shadow-lg/40 border border-zinc-800"
        >
          <AnimatePresence mode="wait" initial={false}>
            <LayoutGroup id="FormGroup">
              {!isReset && (
                <LogInForm
                  key="login-form"
                  handleLogin={handleLogin}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  setReset={setReset}
                  loading={loading}
                />
              )}
              {isReset && (
                <SendResetPassword
                  key="resetpword-form"
                  email={email}
                  setEmail={setEmail}
                  setReset={setReset}
                  createPopUp={createErrorPopUp}
                />
              )}
            </LayoutGroup>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
}

function SendResetPassword({
  email,
  setEmail,
  setReset,
  createPopUp,
}: ResetProps) {
  const [sending, setSending] = useState(false);
  const { resetPassword } = useAuth();
  const requirement = "@pickensgasheriff.com";
  const inputStyle =
    "border-2 border-zinc-500 w-full text-zinc-200 bg-zinc-900 autofill:text-zinc-200 autofill:bg-zinc-900 rounded-lg py-2 px-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:shadow-[0_0_15px_2px_#0ea5e9]";

  async function handleSend() {
    setSending(true);
    if (!email.includes(requirement)) {
      createPopUp({
        title: "Oops!",
        message: "Must use agency email",
        location: "top-center",
        timer: 3,
      });
      setSending(false);
      return;
    }
    try {
      await resetPassword(email);
      setSending(false);
      createPopUp({
        title: "Email Sent!",
        message: "Check your email for the reset link.",
        location: "top-center",
        timer: 3,
      });
      setReset(false);
    } catch (e) {
      console.log(e);
      setSending(false);
    }
  }

  return (
    <motion.div
      layout
      initial={{ x: 600, filter: "blur(15px)" }}
      animate={{ x: 0, filter: "none" }}
      exit={{ x: 600, filter: "blur(15px)" }}
      transition={{ type: "tween", duration: 0.3 }}
      className="text-zinc-200 flex w-full items-center justify-center gap-4 flex-col"
    >
      <motion.div
        layout
        className="flex pb-4 w-full items-center justify-center"
      >
        <motion.div
          layout
          whileHover={{ scale: 1.1 }}
          transition={{ type: "tween", duration: 0.2 }}
          onClick={() => setReset(false)}
          className="w-full flex hover:cursor-pointer items-center justify-start"
        >
          <BsArrowLeft size={40} />
        </motion.div>
        <motion.div className="text-2xl px-10 text-nowrap font-semibold w-full">
          Reset Password
        </motion.div>
        <motion.div layout className="w-full"></motion.div>
      </motion.div>
      <motion.div className="w-full flex flex-col items-center justify-center">
        <motion.label
          layout
          className="text-lg font-senibold text-zinc-200 mb-1 flex items-start justify-start w-full"
        >
          <div className="">Email</div>
        </motion.label>
        <motion.input
          layout
          type="email"
          className={inputStyle}
          placeholder="you@pickensgasheriff.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </motion.div>
      <Button
        text={sending ? "...Sending Link" : "Send Reset Link"}
        action={handleSend}
        disabled={sending}
      />
    </motion.div>
  );
}

function LogInForm({
  handleLogin,
  email,
  setEmail,
  password,
  setPassword,
  loading,
  setReset,
}: LogInFormProps) {
  const inputStyle =
    "border-2 border-zinc-500 w-full text-zinc-200 bg-zinc-900 autofill:text-zinc-200 autofill:bg-zinc-900 rounded-lg py-2 px-3 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:shadow focus:shadow-[0_0_15px_2px_#0ea5e9]";

  return (
    <motion.div
      layoutId="FormGroup"
      initial={{ x: -600, filter: "blur(15px)" }}
      animate={{ x: 0, filter: "none" }}
      exit={{ x: -600, filter: "blur(15px)" }}
      transition={{ type: "tween", duration: 0.3 }}
      className="w-full"
    >
      <h2 className="text-2xl font-bold text-zinc-200 mb-6 text-center">
        Welcome Back
      </h2>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-lg font-senibold text-zinc-200 mb-1">
            Email
          </label>
          <input
            type="email"
            className={inputStyle}
            placeholder="you@pickensgasheriff.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-zinc-200 mb-1">
            Password
          </label>
          <input
            type="password"
            className={inputStyle}
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <Button
          text={loading ? "Loading..." : "Sign In"}
          action={() => {}}
          type="submit"
          disabled={loading}
        />
      </form>

      <div className="mt-4 flex items-center justify-center gap-2 text-center text-sm text-zinc-200">
        Problem logging in?{" "}
        <a
          onClick={() => setReset(true)}
          className="text-sky-500 hover:underline hover:cursor-pointer"
        >
          Reset password
        </a>
      </div>
    </motion.div>
  );
}
