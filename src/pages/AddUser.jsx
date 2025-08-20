import { motion } from "motion/react";
import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "../components/Button";

export default function AddUser() {
  const { data, loading } = useOutletContext();
  const { register, handleSubmit } = useForm();
  const inputStyle =
    "border-2 border-zinc-900  text-zinc-200 bg-zinc-900 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:shadow-[0_0_15px_2px_rgba(3,105,161,7)] ";

  return (
    <motion.div className="h-full w-full relative flex items-center justify-center">
      <motion.div
        id="panel"
        className="flex p-4 gap-4 flex-col items-center justify-center bg-zinc-950/40 border border-zinc-700 rounded-xl text-zinc-200 font-semibold"
      >
        <div className="w-full flex justify-start items-center text-xl">
          Create User
        </div>
        <form
          onSubmit={handleSubmit(() => {})}
          className="grid grid-cols-2 gap-4"
        >
          <input
            {...register("firstName")}
            className={inputStyle}
            type="text"
            placeholder="First Name"
          />
          <input
            {...register("lastName")}
            className={inputStyle}
            type="text"
            placeholder="Last Name"
          />
          <input
            {...register("email")}
            className={inputStyle}
            type="email"
            placeholder="Email"
          />
          <input
            {...register("password")}
            className={inputStyle}
            type="password"
            placeholder="Temporary Password"
          />
        </form>
      </motion.div>
    </motion.div>
  );
}
