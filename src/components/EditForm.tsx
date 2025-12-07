import { useState, useEffect, RefObject, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import {
  useForm,
  Controller,
  type DefaultValues,
  type SubmitHandler,
  type SubmitErrorHandler,
} from "react-hook-form";

import { useUser } from "../pages/context/UserContext";
import type { User } from "../pages/context/UserContext";

import { useConfigure } from "../pages/context/configureContext";
import Button from "../components/Button";
import ToggleSwitch from "../components/ToggleSwitch";
import { useSafeSettings } from "../pages/hooks/useSafeSettings";
import { useBreakpoint } from "../pages/hooks/useBreakpoint";

import type { Item, ListData } from "./ListPanel";

// ---------- Config-derived types ----------

type ConfigOption = [id: string, title: string, order: number];

type ConfigGroup = {
  field: string; // safe key in the form (e.g., "Special_Roles")
  label: string; // display label (e.g., "Special Roles")
  options: ConfigOption[];
};

// ---------- Form values ----------

export type FormValues = {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  secondPhone: string;
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

  Divisions?: string;

  // config-driven extras:
  Special_Roles?: string;

  // ADC toggles
  ftoList?: boolean;
  jailSchool?: boolean;
  isMandated?: boolean;
};

export type UserNoP = Omit<User, "password">;

interface EditFormProps {
  userProps: User;
  submitFunction: (data: FormValues) => Promise<boolean>;
  formRef?: RefObject<HTMLFormElement | null>;
}

// ---------- helpers ----------

type ConfigureData = Record<string, ListData> | ListData[] | undefined;
type FormFieldName = Extract<keyof FormValues, string>;

function toFieldKey(title: string): string {
  return title.trim().replace(/\s+/g, "");
}

function toGroups(data: ConfigureData): ConfigGroup[] {
  if (!data) return [];
  const listArray: ListData[] = Array.isArray(data)
    ? data
    : Object.values(data);

  return listArray.map((panel) => {
    const options: ConfigOption[] = Object.entries(panel.items ?? {}).map(
      ([id, it]: [string, Item]) => [id, it.title, it.order]
    );
    options.sort((a, b) => a[2] - b[2]);

    const field =
      panel.title === "Divisions"
        ? "Divisions"
        : toFieldKey(panel.title.replace("-", ""));

    return {
      field,
      label: panel.title,
      options,
    };
  });
}

function dynamicDefaultsFromUser(
  groups: ConfigGroup[],
  userProps: User
): Partial<FormValues> {
  return groups.reduce<Partial<FormValues>>((acc, { field, label }) => {
    const byField = (userProps as any)?.[field];
    const byLabel = (userProps as any)?.[label];
    const v = typeof byField === "string" ? byField : byLabel;
    (acc as any)[field] = v || "";
    return acc;
  }, {});
}

function toDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatPhone(value: string) {
  const digits = toDigits(value);
  const len = digits.length;

  if (len < 4) return digits;
  if (len < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

export default function EditForm({
  userProps,
  submitFunction,
  formRef,
}: EditFormProps) {
  const { data: configData } = useConfigure();
  const { data: users, userSettings } = useUser();
  const [updating, setUpdating] = useState(false);
  const { primaryAccent } = useSafeSettings();
  const [groups, setGroups] = useState<ConfigGroup[]>([]);
  const id = "formGroup";
  const { twoXlUp } = useBreakpoint();

  const toggleSize = twoXlUp ? "md" : "xs";

  const baseDefaults: DefaultValues<FormValues> = useMemo(
    () => ({
      uid: userProps.uid ?? "",
      firstName: userProps.firstName ?? "",
      lastName: userProps.lastName ?? "",
      email: userProps.email ?? "",
      phone: userProps.phone ?? "",
      secondPhone: userProps.secondPhone ?? "",
      badge: userProps.badge ?? "",
      car: userProps.car ?? "",

      oic: !!userProps.oic,
      fto: !!userProps.fto,
      mandate: !!userProps.mandate,
      trainee: !!userProps.trainee,
      Shifts: userProps.Shifts ?? "",
      Ranks: userProps.Ranks ?? "",
      Role: userProps.Role ?? "",
      active: userProps.active ?? true,

      ftoList: userProps.ftoList,
      jailSchool: userProps.jailSchool,
      isMandated: userProps.isMandated,

      trainer: userProps.trainer ?? "",
      phase: userProps.phase ?? "",

      pit: !!userProps.pit,
      speed: !!userProps.speed,
      rifle: !!userProps.rifle,

      Divisions: userProps.Divisions ?? "",
    }),
    [userProps]
  );

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: baseDefaults,
    shouldUnregister: false,
  });

  const trainee = watch("trainee");
  const upd = watch("Divisions");

  const toggleStyle =
    "flex flex-col justify-center items-center 2xl:text-base text-xs text-nowrap gap-2 2xl:gap-2";
  const inputStyle =
    "border-2 border-zinc-500 w-full text-zinc-200 text-md 2xl:text-base bg-zinc-900 rounded-md 2xl:rounded-lg py-1 px-1.5 2xl:py-2 2xl:px-3 focus:border-[var(--accent)] focus:outline-none focus:ring-1 2xl:focus:ring-2 [--tw-ring-color:var(--accent)] focus:shadow-[0_0_10px_1px_var(--accent)] 2xl:focus:shadow-[0_0_15px_2px_var(--accent)]";

  useEffect(() => {
    console.log(upd);
  }, [upd]);

  // build groups from configure
  useEffect(() => {
    const gs = toGroups(configData);
    setGroups(gs);
  }, [configData]);

  // reset defaults whenever config groups or userProps change
  useEffect(() => {
    if (!groups.length) return;
    reset({
      ...baseDefaults,
      ...dynamicDefaultsFromUser(groups, userProps),
    });
  }, [groups, baseDefaults, userProps, reset]);

  function cleanValues(values: FormValues): FormValues {
    return {
      ...values,
      firstName: values.firstName ?? "",
      lastName: values.lastName ?? "",
      email: values.email ?? "",
      badge: values.badge ?? "",
      car: values.car ?? "",
      Shifts: values.Shifts ?? "",
      Role: values.Role ?? "",
      Ranks: values.Ranks ?? "",
      Divisions: values.Divisions ?? "",
      phone: values.phone ?? "",
      secondPhone: values.secondPhone ?? "",
      trainer: values.trainer ?? "",
      phase: values.phase ?? "",
    };
  }

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    const cleaned = cleanValues(values);
    setUpdating(true);
    await submitFunction(cleaned);

    setUpdating(false);
  };

  const onError: SubmitErrorHandler<FormValues> = (errs) => {
    console.log("FORM ERRORS:", errs);
  };

  return (
    <motion.div className="h-full w-full relative flex items-center justify-center">
      <AnimatePresence>
        <LayoutGroup id={id}>
          <motion.div
            layout
            id="panel"
            className="flex p-2 2xl:p-4 gap-2 2xl:gap-4 flex-col items-center justify-center rounded-xl text-zinc-200 font-semibold"
          >
            <motion.div
              layout
              className="w-full flex justify-start items-center text-2xl"
            >
              Edit User
            </motion.div>

            <motion.form
              ref={formRef}
              onSubmit={handleSubmit(onSubmit, onError)}
              layout="position"
              transition={{ type: "tween" }}
              className="grid grid-cols-2 2xl:gap-6 gap-4 place-items-center font-normal 2xl:font-medium"
            >
              {/* FIRST NAME - controlled */}
              <Controller
                name="firstName"
                control={control}
                rules={{ required: "First name is required" }}
                render={({ field }) => (
                  <motion.input
                    layout
                    {...field}
                    className={inputStyle}
                    type="text"
                    placeholder="First Name"
                  />
                )}
              />

              {/* LAST NAME - controlled */}
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <motion.input
                    layout
                    {...field}
                    className={inputStyle}
                    type="text"
                    placeholder="Last Name"
                  />
                )}
              />

              {/* EMAIL - controlled */}
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <motion.input
                    layout
                    {...field}
                    style={{ gridColumn: "span 2" }}
                    className={inputStyle}
                    type="email"
                    placeholder="Email"
                  />
                )}
              />

              {/* PHONE - controlled with formatter */}
              <Controller
                name="phone"
                control={control}
                defaultValue={baseDefaults.phone ?? ""}
                render={({ field }) => {
                  const display = formatPhone(field.value || "");
                  return (
                    <motion.input
                      layout
                      className={inputStyle}
                      placeholder="Phone Number"
                      value={display}
                      onChange={(e) => {
                        const raw = toDigits(e.target.value);
                        field.onChange(raw);
                      }}
                    />
                  );
                }}
              />
              <Controller
                name="secondPhone"
                control={control}
                defaultValue={baseDefaults.phone ?? ""}
                render={({ field }) => {
                  const display = formatPhone(field.value || "");
                  return (
                    <motion.input
                      layout
                      className={inputStyle}
                      placeholder="Second Phone Number"
                      value={display}
                      onChange={(e) => {
                        const raw = toDigits(e.target.value);
                        field.onChange(raw);
                      }}
                    />
                  );
                }}
              />

              {/* BADGE - controlled */}
              <Controller
                name="badge"
                control={control}
                render={({ field }) => (
                  <motion.input
                    layout
                    {...field}
                    className={inputStyle}
                    type="text"
                    placeholder="Badge Number"
                  />
                )}
              />

              {/* CAR - controlled */}
              {upd === "UPD" && (
                <Controller
                  name="car"
                  control={control}
                  render={({ field }) => (
                    <motion.input
                      layout
                      {...field}
                      className={inputStyle}
                      type="text"
                      placeholder="Car Number"
                    />
                  )}
                />
              )}

              {/* Dynamic selects from configure data */}
              {groups.map(({ field, label, options }) => (
                <motion.select
                  layout
                  key={field}
                  {...register(field as FormFieldName)}
                  className={inputStyle}
                >
                  <option value="">select {label}</option>
                  {options.map(([id, title]) => (
                    <option key={id} value={title}>
                      {title}
                    </option>
                  ))}
                </motion.select>
              ))}

              {/* Trainee extra fields */}
              <AnimatePresence>
                {(trainee || userProps.trainee) && (
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

              {/* TOGGLES */}
              <motion.div
                layout
                className="col-span-2 gap-2 lg:gap-4 2xl:gap-6 flex items-center justify-center"
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
                        size={toggleSize}
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
                        size={toggleSize}
                      />
                    )}
                  />
                </div>

                {upd === "ADC" && (
                  <div className={toggleStyle}>
                    <span>Mandate</span>
                    <Controller
                      name="mandate"
                      control={control}
                      render={({ field }) => (
                        <ToggleSwitch
                          state={!!field.value}
                          setState={field.onChange}
                          size={toggleSize}
                        />
                      )}
                    />
                  </div>
                )}

                <div className={toggleStyle}>
                  <span>Trainee</span>
                  <Controller
                    name="trainee"
                    control={control}
                    render={({ field }) => (
                      <ToggleSwitch
                        state={!!field.value}
                        setState={field.onChange}
                        size={toggleSize}
                      />
                    )}
                  />
                </div>

                {upd === "ADC" && (
                  <>
                    <div className={toggleStyle}>
                      <span>FTO List</span>
                      <Controller
                        name="ftoList"
                        control={control}
                        render={({ field }) => (
                          <ToggleSwitch
                            state={!!field.value}
                            setState={field.onChange}
                            size={toggleSize}
                          />
                        )}
                      />
                    </div>
                    <div className={toggleStyle}>
                      <span>Mandated</span>
                      <Controller
                        name="isMandated"
                        control={control}
                        render={({ field }) => (
                          <ToggleSwitch
                            state={!!field.value}
                            setState={field.onChange}
                            size={toggleSize}
                          />
                        )}
                      />
                    </div>
                    <div className={toggleStyle}>
                      <span>Jail School</span>
                      <Controller
                        name="jailSchool"
                        control={control}
                        render={({ field }) => (
                          <ToggleSwitch
                            state={!!field.value}
                            setState={field.onChange}
                            size={toggleSize}
                          />
                        )}
                      />
                    </div>
                  </>
                )}

                {(upd === "UPD" || userProps.Divisions === "UPD") && (
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
                            size={toggleSize}
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
                            size={toggleSize}
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
                            size={toggleSize}
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
