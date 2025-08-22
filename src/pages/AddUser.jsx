import { AnimatePresence, motion } from "motion/react";
import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Button from "../components/Button";
import ToggleSwitch from "../components/ToggleSwitch";

export default function AddUser() {
  const { data, loading } = useOutletContext();
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      oic: false,
      fto: false,
      mandate: false,
      trainee: false,
      pit: false,
      speed: false,
      rifle: false,
    },
  });
  const trainee = watch("trainee");
  const shifts = [
    "Alpha",
    "Bravo",
    "Charlie",
    "Delta",
    "Split: Alpha & Bravo",
    "Split: Charlie & Delta",
  ];
  const ranks = [
    "Major",
    "Lieutenant",
    "Sergeant",
    "Deputy (Level 2)",
    "Deputy (Level 1)",
    "Trainee",
  ];
  const divisions = ["adc", "upd"];
  const toggleStyle = "flex flex-col justify-center items-center gap-2";
  const inputStyle =
    "border-2 border-zinc-900  text-zinc-200 bg-zinc-900 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:shadow-[0_0_15px_2px_rgba(3,105,161,7)] ";

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <motion.div className="h-full w-full relative flex items-center justify-center">
      <AnimatePresence>
        <motion.div
          layout
          id="panel"
          className="flex p-6 gap-4 flex-col items-center justify-center bg-zinc-950/40 border border-zinc-700 rounded-xl text-zinc-200 font-semibold"
        >
          <div className="w-full flex justify-start items-center text-2xl">
            Create User
          </div>
          <motion.form
            layout="position"
            transition={{ type: "tween" }}
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-6"
          >
            <motion.input
              layout
              {...register("firstName", { require: "First name is required" })}
              className={inputStyle}
              type="text"
              placeholder="First Name"
            />
            <motion.input
              layout
              {...register("lastName")}
              className={inputStyle}
              type="text"
              placeholder="Last Name"
            />
            <motion.input
              layout
              {...register("email")}
              className={inputStyle}
              type="email"
              placeholder="Email"
            />
            <motion.input
              layout
              {...register("password")}
              className={inputStyle}
              type="password"
              placeholder="Temporary Password"
            />
            <motion.input
              layout
              {...register("phone")}
              className={inputStyle}
              type="text"
              placeholder="Phone Number"
            />
            <motion.input
              layout
              {...register("badge")}
              className={inputStyle}
              type="text"
              placeholder="Badge Number"
            />
            <motion.input
              layout
              {...register("car")}
              className={inputStyle}
              type="text"
              placeholder="Car Number"
            />
            <motion.select
              layout
              {...register("shift", { required: true })}
              className={inputStyle}
            >
              <option value={""}>Select a Shift</option>
              {shifts.map((shift) => (
                <option key={shift} value={shift}>
                  {shift}
                </option>
              ))}
            </motion.select>
            <motion.select
              layout
              {...register("division", { required: true })}
              className={inputStyle}
            >
              <option value={""}>Select a Division</option>
              {divisions.map((division) => (
                <option key={division} value={division}>
                  {division.toUpperCase()}
                </option>
              ))}
            </motion.select>
            <motion.select
              layout
              {...register("rank", { required: true })}
              className={inputStyle}
            >
              <option value={""}>Select Rank</option>
              {ranks.map((rank) => (
                <option key={rank} value={rank.toLowerCase()}>
                  {rank}
                </option>
              ))}
            </motion.select>
            <motion.select layout {...register("title")} className={inputStyle}>
              <option value={""}>Select Title</option>
            </motion.select>
            <motion.select
              {...register("supervisor")}
              layout
              className={inputStyle}
            >
              <option value={""}>Select Supervisor</option>
            </motion.select>
            <AnimatePresence>
              {trainee && (
                <div
                  key="train-container"
                  className="grid grid-cols-2 col-span-2 gap-4"
                >
                  <motion.select
                    {...register("trainer", { required: true })}
                    key="trainer"
                    layout="position"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className={inputStyle}
                  >
                    <option value={null}>Select Trainer</option>
                  </motion.select>
                  <motion.select
                    {...register("phase", { required: true })}
                    key="phase"
                    layout
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className={inputStyle}
                  >
                    <option value={null}>Select Phase</option>
                  </motion.select>
                </div>
              )}
            </AnimatePresence>
            <div className="col-span-2 gap-6 flex items-center justify-center">
              <div className={toggleStyle}>
                <span className="">OIC</span>
                <Controller
                  name="oic"
                  control={control}
                  render={({ field }) => (
                    <ToggleSwitch
                      state={!!field.value}
                      setState={field.onChange}
                    />
                  )}
                />
              </div>
              <div className={toggleStyle}>
                <span className="">FTO</span>
                <Controller
                  name="fto"
                  control={control}
                  render={({ field }) => (
                    <ToggleSwitch
                      state={!!field.value}
                      setState={field.onChange}
                    />
                  )}
                />
              </div>
              <div className={toggleStyle}>
                <span className="">Madate</span>
                <Controller
                  name="mandate"
                  control={control}
                  render={({ field }) => (
                    <ToggleSwitch
                      state={!!field.value}
                      setState={field.onChange}
                    />
                  )}
                />
              </div>
              <div className={toggleStyle}>
                <span className="">Trainee</span>
                <Controller
                  name="trainee"
                  control={control}
                  render={({ field }) => (
                    <ToggleSwitch
                      state={!!field.value}
                      setState={field.onChange}
                    />
                  )}
                />
              </div>
              <div className={toggleStyle}>
                <span className="">PIT</span>
                <Controller
                  name="pit"
                  control={control}
                  render={({ field }) => (
                    <ToggleSwitch
                      state={!!field.value}
                      setState={field.onChange}
                    />
                  )}
                />
              </div>
              <div className={toggleStyle}>
                <span className="">Speed</span>
                <Controller
                  name="speed"
                  control={control}
                  render={({ field }) => (
                    <ToggleSwitch
                      state={!!field.value}
                      setState={field.onChange}
                    />
                  )}
                />
              </div>
              <div className={toggleStyle}>
                <span className="">Rifle</span>
                <Controller
                  name="rifle"
                  control={control}
                  render={({ field }) => (
                    <ToggleSwitch
                      state={!!field.value}
                      setState={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
            <div className="flex col-span-2">
              <Button text="Add User" action={() => {}} type="submit" />
            </div>
          </motion.form>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
