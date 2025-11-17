import { useState, useEffect, SetStateAction, RefObject } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { useForm, Controller, type DefaultValues } from "react-hook-form";

import { useUser } from "../pages/context/UserContext";
import type { User } from "../pages/context/UserContext";

import { useConfigure } from "../pages/context/configureContext";
import Button from "../components/Button";
import ToggleSwitch from "../components/ToggleSwitch";

import type { Item, ListData } from "./ListPanel";

// ---------- Config-derived types ----------
/** One option tuple taken from a ListData.items entry: [id, title, order] */
type ConfigOption = [id: string, title: string, order: number];
/** One select group: [groupTitle, options[]] */
type ConfigGroup = [groupTitle: string, options: ConfigOption[]];

// ---------- Form values ----------
/**
 * Base static fields + dynamic keys by group title (e.g., "Divisions", "Shifts"...)
 * Dynamic keys are strings (selected option titles).
 */
export type FormValues = {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
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
  Shifts: string;
  Role: string;
  Ranks: string;
  active: boolean;

  // Watch for your conditional:
  Divisions?: string;

  // Dynamic select fields keyed by group title:
  [dynamicKey: string]: unknown;
};

export type UserNoP = Omit<User, "password">;

interface EditFormProps {
  userProps: User; // you said "user is going to be userProps"
  submitFunction: (data: FormValues) => Promise<boolean>;
  formRef?: RefObject<HTMLFormElement | null>;
}

export default function EditForm({
  userProps,
  submitFunction,
  formRef,
}: EditFormProps) {
  const { data: configData } = useConfigure();
  const { addUser, data: users, userSettings } = useUser();
  const [updating, setUpdating] = useState(false);
  const { primaryAccent, secondaryAccent } = userSettings;
  const id = "formGroup";

  const [groups, setGroups] = useState<ConfigGroup[]>([]);

  // ---------- helpers ----------
  type ConfigureData = Record<string, ListData> | ListData[] | undefined;

  function toGroups(data: ConfigureData): ConfigGroup[] {
    if (!data) return [];
    const listArray: ListData[] = Array.isArray(data)
      ? data
      : Object.values(data);

    return listArray.map((panel) => {
      // panel.items is Record<string, Item>
      const options: ConfigOption[] = Object.entries(panel.items ?? {}).map(
        ([id, it]: [string, Item]) => [id, it.title, it.order]
      );
      // sort options by order (3rd tuple element)
      options.sort((a, b) => a[2] - b[2]);
      return [panel.title, options];
    });
  }

  // ---------- base defaults from userProps ----------
  const baseDefaults: DefaultValues<FormValues> = {
    uid: (userProps as any).uid || "",
    firstName: (userProps as any).firstName || "",
    lastName: (userProps as any).lastName || "",
    email: (userProps as any).email || "",
    phone: (userProps as any).phone || "",
    badge: (userProps as any).badge || "",
    car: (userProps as any).car || "",

    oic: !!(userProps as any).oic,
    fto: !!(userProps as any).fto,
    mandate: !!(userProps as any).mandate,
    trainee: !!(userProps as any).trainee,
    Shifts: (userProps as any).Shifts || "",
    Ranks: (userProps as any).Ranks || "",
    Role: (userProps as any).Role || "",
    active: !!(userProps as any).active,

    trainer: (userProps as any).trainer || "",
    phase: (userProps as any).phase || "",

    pit: !!(userProps as any).pit,
    speed: !!(userProps as any).speed,
    rifle: !!(userProps as any).rifle,

    Divisions: (userProps as any).Divisions || "",
  };

  // dynamic defaults: for each panel.title, use userProps[title] || ""
  const dynamicDefaultsFromUser = (gs: ConfigGroup[]): Record<string, string> =>
    gs.reduce<Record<string, string>>((acc, [groupTitle]) => {
      const v = (userProps as any)?.[groupTitle];
      acc[groupTitle] = (typeof v === "string" ? v : "") || "";
      return acc;
    }, {});

  // ---------- form ----------
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: baseDefaults,
  });

  const trainee = watch("trainee");
  const upd = watch("Divisions"); // if your group is named exactly "Divisions"

  const toggleStyle = "flex flex-col justify-center items-center gap-2";
  const inputStyle =
    "border-2 border-zinc-500 w-full text-zinc-200 bg-zinc-900 rounded-lg py-2 px-3 focus:border-[var(--accent)] focus:outline-none focus:ring-2 [--tw-ring-color:var(--accent)] focus:shadow-[0_0_15px_2px_var(--accent)]";

  // prepare groups and reset defaults when config or user changes
  useEffect(() => {
    const gs = toGroups(configData);
    setGroups(gs);
    reset({
      ...baseDefaults,
      ...dynamicDefaultsFromUser(gs),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configData, userProps]);

  const onSubmit = async (values: FormValues) => {
    setUpdating(true);
    const completed = await submitFunction(values as FormValues);
    if (completed) reset(baseDefaults);
    setUpdating(false);
    if (!completed) setUpdating(false);
  };

  return (
    <motion.div className="h-full w-full relative flex items-center justify-center">
      <AnimatePresence>
        <LayoutGroup id={id}>
          <motion.div
            layout
            id="panel"
            className="flex p-4  gap-4 flex-col items-center justify-center rounded-xl text-zinc-200 font-semibold"
          >
            <motion.div
              layout
              className="w-full flex justify-start items-center text-2xl"
            >
              Edit User
            </motion.div>

            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              layout="position"
              transition={{ type: "tween" }}
              className="grid grid-cols-2 gap-6 place-items-center font-medium"
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
                style={{ gridColumn: "span 2" }}
                className={inputStyle}
                type="email"
                placeholder="Email"
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

              {/* Dynamic selects from configure data */}
              {groups.map(([groupTitle, options]) => (
                <motion.select
                  layout
                  key={groupTitle}
                  {...register(groupTitle)}
                  className={inputStyle}
                >
                  <option value="">select {groupTitle}</option>
                  {options.map(([id, title]) => (
                    <option key={id} value={title}>
                      {title}
                    </option>
                  ))}
                </motion.select>
              ))}

              <AnimatePresence>
                {trainee && (
                  <motion.div
                    key="train-container"
                    layoutId={id}
                    className="grid grid-cols-2 w-full col-span-2 gap-4"
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
                      <option value="">Select Trainer</option>
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
                      <option value="">Select Phase</option>
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
                  <span>OIC</span>
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
                  <span>FTO</span>
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
                  <span>Mandate</span>
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
                  <span>Trainee</span>
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

                {upd === "UPD" && (
                  <>
                    <div className={toggleStyle}>
                      <span>PIT</span>
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
                      <span>Speed</span>
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
                      <span>Rifle</span>
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
                  </>
                )}
              </motion.div>
              <motion.div layout className="col-span-2 w-full">
                <Button
                  text={updating ? "Updating..." : "Update User"}
                  action={() => {}}
                  disabled={updating}
                  color={updating ? "#0369a1" : primaryAccent}
                  type="submit"
                />
              </motion.div>
            </motion.form>
          </motion.div>
        </LayoutGroup>
      </AnimatePresence>
    </motion.div>
  );
}
