import { AnimatePresence, motion } from "motion/react";
import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Button from "../components/Button";
import ToggleSwitch from "../components/ToggleSwitch";
import { useConfigure } from "./context/configureContext";
import { useUser } from "./context/UserContext";

//TODO:
// Create pop ups for error handling
// Define which fields are required
// Create listeners to see which division is selected

export default function AddUser() {
  const { data, loading } = useOutletContext();
  const { data: configData } = useConfigure();
  const [dropDownData, setDropDownData] = useState([]);
  const { addUser } = useUser();
  const baseDefaults = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    badge: "",
    car: "",
    oic: false,
    fto: false,
    mandate: false,
    trainee: false,
    trainer: "",
    phase: "",
    pit: false,
    speed: false,
    rifle: false,
  };

  const dynamicDefaults = Object.fromEntries(
    (dropDownData ?? []).map(([key]) => [key, ""])
  );

  const defaultValues = { ...baseDefaults, ...dynamicDefaults };
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });
  const trainee = watch("trainee");
  const upd = watch("Divisions");
  const toggleStyle = "flex flex-col justify-center items-center gap-2";
  const inputStyle =
    "border-2 border-zinc-500 w-full text-zinc-200 bg-zinc-900 rounded-lg py-2 px-3 focus:border-[var(--accent)] focus:outline-none focus:ring-2 [--tw-ring-color:var(--accent)] focus:shadow-[0_0_15px_2px_var(--accent)]";

  const onSubmit = (data) => {
    addUser(data);
    reset(defaultValues);
  };

  useEffect(() => {
    configData && setDropDownData(prepareConfig(configData));
    configData && sortConfig(prepareConfig(configData));
  }, [configData]);

  function prepareConfig(data) {
    return Object.values(data).map((item) => [
      item.title,
      Object.entries(item?.items).map(([key, value]) => [
        key,
        value.title,
        value.order,
      ]),
    ]);
  }

  function sortConfig(items) {
    return items.sort((a, b) => a[2] - b[2]);
  }

  return (
    <motion.div className="h-full w-full relative flex items-center justify-center">
      <AnimatePresence>
        <motion.div
          layout
          id="panel"
          className="flex p-10 gap-4 flex-col items-center justify-center bg-zinc-950/30 border border-zinc-800 rounded-xl text-zinc-200 font-semibold"
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

            {dropDownData &&
              dropDownData.map((item) => (
                <motion.select
                  layout
                  key={item[1]}
                  {...register(item[0])}
                  className={inputStyle}
                >
                  <option value={""}>select {item[0]}</option>
                  {item[1] &&
                    sortConfig(item[1]).map((items) => (
                      <option key={items[0]} value={items[1]}>
                        {items[1]}
                      </option>
                    ))}
                </motion.select>
              ))}

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
                  defaultValue={false}
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
                  defaultValue={false}
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
                  defaultValue={false}
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
                  defaultValue={false}
                  render={({ field }) => (
                    <ToggleSwitch
                      state={!!field.value}
                      setState={field.onChange}
                    />
                  )}
                />
              </div>
              {upd === "UPD" && (
                <>
                  <div className={toggleStyle}>
                    <span className="">PIT</span>
                    <Controller
                      name="pit"
                      control={control}
                      defaultValue={false}
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
                      defaultValue={false}
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
                      defaultValue={false}
                      render={({ field }) => (
                        <ToggleSwitch
                          state={!!field.value}
                          setState={field.onChange}
                        />
                      )}
                    />
                  </div>{" "}
                </>
              )}
            </div>
            <div className="flex col-span-2">
              <Button
                text="Add User"
                action={() => handleSubmit(onSubmit)}
                type="submit"
              />
            </div>
          </motion.form>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
