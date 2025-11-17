import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useOutletContext } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import Button from "../components/Button";
import ToggleSwitch from "../components/ToggleSwitch";
import { useConfigure } from "./context/configureContext";
import { useUser } from "./context/UserContext";

// Shape of the form values
type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  badge: string;
  car: string;

  oic: boolean;
  fto: boolean;
  mandate: boolean;
  trainee: boolean;

  trainer: string;
  phase: string;

  pit: boolean;
  speed: boolean;
  rifle: boolean;

  // This is the one you’re watching below
  Divisions?: string;

  // Allow dynamic config-driven keys (e.g. Shifts, Locations, etc.)
  [key: string]: string | boolean | undefined;
};

type DropDownItem = [string, [string, string, number][]];

export default function AddUser() {
  const { data: configData } = useConfigure();
  const [dropDownData, setDropDownData] = useState<DropDownItem[]>([]);
  const { addUser, data: users } = useUser();
  const id = "formGroup";

  const baseDefaults: FormValues = {
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

    Divisions: "",
  };

  // Build dynamic defaults (e.g. Divisions, Shifts, etc.) when dropdown config changes
  const dynamicDefaults = useMemo(
    () =>
      Object.fromEntries(
        (dropDownData ?? []).map(([key]) => [key, ""])
      ) as Partial<FormValues>,
    [dropDownData]
  );

  const defaultValues: FormValues = useMemo(
    () => ({ ...baseDefaults, ...dynamicDefaults }),
    [dynamicDefaults]
  ) as FormValues;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues });

  const trainee = watch("trainee");
  const upd = watch("Divisions"); // typed as string | undefined

  const toggleStyle = "flex flex-col justify-center items-center gap-2";
  const inputStyle =
    "border-2 border-zinc-500 w-full text-zinc-200 bg-zinc-900 rounded-lg py-2 px-3 focus:border-[var(--accent)] focus:outline-none focus:ring-2 [--tw-ring-color:var(--accent)] focus:shadow-[0_0_15px_2px_var(--accent)]";

  // When configData arrives, build dropdown config
  useEffect(() => {
    if (!configData) return;
    const prepared = prepareConfig(configData);
    setDropDownData(prepared);
  }, [configData]);

  // Whenever defaultValues changes (because dropdown config changed),
  // sync the form with those defaults.
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = (data: FormValues) => {
    addUser(data as any);
    reset(defaultValues);
  };

  function prepareConfig(data: any): DropDownItem[] {
    return Object.values(data).map((item: any) => [
      item.title as string,
      Object.entries(item?.items).map(([key, value]: [string, any]) => [
        key,
        value.title as string,
        Number(value.order ?? 0),
      ]),
    ]);
  }

  function sortConfig(items: [string, string, number][]) {
    return items.sort((a, b) => a[2] - b[2]);
  }

  return (
    <motion.div
      layout
      className="h-full w-full relative flex items-center justify-center"
    >
      <AnimatePresence>
        <LayoutGroup id={id}>
          <motion.div
            layout
            id="panel"
            className="flex p-10 gap-4 flex-col items-center justify-center bg-zinc-950/30 border border-zinc-800 rounded-xl text-zinc-200 font-semibold"
          >
            <motion.div
              layout
              className="w-full flex justify-start items-center text-2xl"
            >
              Create User
            </motion.div>
            <motion.form
              layout="position"
              transition={{ type: "tween" }}
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-2 place-items-center gap-6"
            >
              <motion.input
                layout
                {...register("firstName", {
                  required: "First name is required",
                })}
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
                dropDownData.map(([groupTitle, items]) => (
                  <motion.select
                    layout
                    key={groupTitle}
                    {...register(groupTitle)}
                    className={inputStyle}
                  >
                    <option value={""}>select {groupTitle}</option>
                    {items &&
                      sortConfig(items).map(([key, value]) => (
                        <option key={key} value={value}>
                          {value}
                        </option>
                      ))}
                  </motion.select>
                ))}

              <AnimatePresence>
                {trainee && (
                  <motion.div
                    key="train-container"
                    className="grid w-full grid-cols-2 col-span-2 gap-4"
                    layoutId={id}
                    initial={{ overflow: "hidden" }}
                    animate={{ overflow: "visible" }}
                    exit={{ overflow: "hidden" }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.select
                      {...register("trainer", { required: trainee })}
                      key="trainer"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 50 }}
                      transition={{ duration: 0.3 }}
                      className={inputStyle}
                    >
                      <option value={""}>Select Trainer</option>
                      {users &&
                        Object.values(users)
                          .filter((user) => user.fto)
                          .map((user) => (
                            <option
                              key={user.uid}
                              value={user.uid}
                            >{`${user.lastName}, ${user.firstName[0]} #${user.badge}`}</option>
                          ))}
                    </motion.select>
                    <motion.select
                      {...register("phase", { required: trainee })}
                      key="phase"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 50 }}
                      transition={{ duration: 0.3 }}
                      className={inputStyle}
                    >
                      <option value={""}>Select Phase</option>
                      <option value="Phase1">Phase 1</option>
                      <option value="Phase2">Phase 2</option>
                    </motion.select>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                layout
                className="col-span-2 gap-6 flex items-center justify-center"
              >
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
                  <span className="">Mandate</span>
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
                    </div>
                  </>
                )}
              </motion.div>

              <motion.div layout className="flex w-full gap-3 col-span-2">
                <Button
                  text="Add User"
                  type="submit"
                  action={() => handleSubmit(onSubmit)}
                />
              </motion.div>
            </motion.form>
          </motion.div>
        </LayoutGroup>
      </AnimatePresence>
    </motion.div>
  );
}
