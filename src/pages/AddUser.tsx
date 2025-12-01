import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Button from "../components/Button";
import ToggleSwitch from "../components/ToggleSwitch";
import { useConfigure } from "./context/configureContext";
import { useUser } from "./context/UserContext";
import PopUp, { type PopUpProps } from "../components/PopUp";
import { useSafeSettings } from "./hooks/useSafeSettings";
import { useBreakpoint } from "./hooks/useBreakpoint";

// Shape of the form values
export type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  secondPhone: string;
  badge: string;
  car: string;

  oic: boolean;
  fto: boolean;
  mandate: boolean;
  trainee: boolean;
  isMandated: boolean;
  ftoList: boolean;

  trainer: string;
  phase: string;

  pit: boolean;
  speed: boolean;
  rifle: boolean;

  Divisions?: string;

  [key: string]: string | boolean | undefined;
};

type DropDownItem = [string, [string, string, number][]];

// ---------------- PARENT: handles addUser, popup, and formKey ----------------

export default function AddUser() {
  const { data: configData } = useConfigure();
  const { addUser, data: users } = useUser();
  const { primaryAccent } = useSafeSettings();

  const [notify, setNotify] = useState<PopUpProps | null>(null);
  const [creating, setCreating] = useState(false);
  const [formKey, setFormKey] = useState(0); // 👈 force remount of inner form

  const id = "formGroup";

  const baseDefaults: FormValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    secondPhone: "",
    badge: "",
    car: "",

    oic: false,
    fto: false,
    mandate: false,
    trainee: false,

    trainer: "",
    phase: "",
    jailSchool: false,
    ftoList: false,
    isMandated: false,

    pit: false,
    speed: false,
    rifle: false,

    Divisions: "",
  };

  function closeNotification() {
    setNotify(null);
  }

  async function handleCreateUser(data: FormValues) {
    console.log("SUBMIT DATA (AddUser):", data);
    setCreating(true);
    try {
      const response = await addUser({ ...data } as any);
      if (response.success) {
        setNotify({
          title: "Success",
          message: "User successfully created",
          location: "top-center",
          onClose: closeNotification,
          timer: 3,
        });

        // 👇 force a full remount of the inner form + useForm
        setFormKey((k) => k + 1);
      } else {
        setNotify({
          title: "Oops!",
          message: "User creation failed",
          location: "top-center",
          onClose: closeNotification,
          timer: 5,
        });
      }
    } catch (e) {
      console.error("addUser failed:", e);
      setNotify({
        title: "Oops!",
        message: "User creation failed",
        location: "top-center",
        onClose: closeNotification,
        timer: 5,
      });
    } finally {
      setCreating(false);
    }
  }

  return (
    <motion.div
      layout
      className="h-full w-full relative flex items-center justify-center"
    >
      {notify && (
        <PopUp
          title={notify.title}
          message={notify.message}
          location={notify.location}
          onClose={notify.onClose}
          timer={notify.timer}
        />
      )}

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

            {/* 👇 inner form remounts whenever formKey changes */}
            <AddUserForm
              key={formKey}
              id={id}
              baseDefaults={baseDefaults}
              configData={configData}
              users={users}
              primaryAccent={primaryAccent}
              creating={creating}
              onCreate={handleCreateUser}
            />
          </motion.div>
        </LayoutGroup>
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------- CHILD: owns useForm and form UI ----------------

interface AddUserFormProps {
  id: string;
  baseDefaults: FormValues;
  configData: any;
  users: any;
  primaryAccent: string;
  creating: boolean;
  onCreate: (data: FormValues) => Promise<void>;
}

function AddUserForm({
  id,
  baseDefaults,
  configData,
  users,
  primaryAccent,
  creating,
  onCreate,
}: AddUserFormProps) {
  const [dropDownData, setDropDownData] = useState<DropDownItem[]>([]);
  const { twoXlUp } = useBreakpoint();

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
  const upd = watch("Divisions");

  const toggleStyle =
    "flex flex-col justify-center items-center 2xl:text-base text-xs text-nowrap gap-2 2xl:gap-2";
  const inputStyle =
    "border-2 border-zinc-500 w-full text-zinc-200 text-sm 2xl:text-base bg-zinc-900 rounded-md 2xl:rounded-lg py-1 px-1.5 2xl:py-2 2xl:px-3 focus:border-[var(--accent)] focus:outline-none focus:ring-1 2xl:focus:ring-2 [--tw-ring-color:var(--accent)] focus:shadow-[0_0_10px_1px_var(--accent)] 2xl:focus:shadow-[0_0_15px_2px_var(--accent)]";

  const toggleSize = twoXlUp ? "md" : "xs";

  // Debug: watch firstName every render of this inner form
  useEffect(() => {
    const sub = watch((values, info) => {
      console.log("WATCH VALUES:", values);
    });
    return () => sub.unsubscribe();
  }, [watch]);

  // Build dropdown options from config
  useEffect(() => {
    if (!configData) return;
    const prepared = prepareConfig(configData);
    setDropDownData(prepared);
  }, [configData]);

  function prepareConfig(data: any): DropDownItem[] {
    if (!data) return [];
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

  const onError = (err: any) => {
    console.log("validation errors", err);
  };

  async function handleValidSubmit(data: FormValues) {
    // let parent do the heavy lifting + remount
    await onCreate(data);
    // no local reset; parent will remount this whole component
  }

  function toDigits(value: string) {
    return value.replace(/\D/g, "");
  }

  function formatPhone(value: string) {
    const digits = toDigits(value);
    const len = digits.length;

    if (len < 4) return digits;
    if (len < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
      6,
      10
    )}`;
  }

  return (
    <motion.form
      key="add-user-form"
      layout="position"
      onKeyDown={(e) => {
        if (e.key === "Enter") e.preventDefault();
      }}
      transition={{ type: "tween" }}
      onSubmit={handleSubmit(handleValidSubmit, onError)}
      className="grid grid-cols-2 place-items-center gap-4 2xl:gap-6"
    >
      <motion.input
        layout
        {...register("firstName")}
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
      <Controller
        name="phone"
        control={control}
        defaultValue=""
        render={({ field }) => {
          const display = formatPhone(field.value); // UI formatted
          return (
            <motion.input
              layout
              className={inputStyle}
              placeholder="Phone Number"
              value={display}
              onChange={(e) => {
                const raw = toDigits(e.target.value); // store only digits
                field.onChange(raw);
              }}
            />
          );
        }}
      />
      <Controller
        name="secondPhone"
        control={control}
        defaultValue=""
        render={({ field }) => {
          const display = formatPhone(field.value); // UI formatted
          return (
            <motion.input
              layout
              className={inputStyle}
              placeholder="Second Phone Number"
              value={display}
              onChange={(e) => {
                const raw = toDigits(e.target.value); // store only digits
                field.onChange(raw);
              }}
            />
          );
        }}
      />

      <motion.input
        layout
        {...register("badge")}
        className={inputStyle}
        type="text"
        placeholder="Badge Number"
      />
      {upd === "UPD" && (
        <motion.input
          layout
          {...register("car")}
          className={inputStyle}
          type="text"
          placeholder="Car Number"
        />
      )}
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
                  .filter((user: any) => user.fto)
                  .map((user: any) => (
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
        className="col-span-2 2xl:gap-6 gap-4 flex items-center justify-center"
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
                size={toggleSize}
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
                size={toggleSize}
              />
            )}
          />
        </div>
        {upd === "ADC" && (
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
                  size={toggleSize}
                />
              )}
            />
          </div>
        )}
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
                    size={toggleSize}
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
                    size={toggleSize}
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
                    size={toggleSize}
                  />
                )}
              />
            </div>
          </>
        )}
      </motion.div>

      <motion.div layout className="flex w-full gap-3 col-span-2">
        {/* If this still breaks, temporarily swap this for a plain <button> */}
        <Button
          text={creating ? "Creating User..." : "Create User"}
          type="submit"
          color={creating ? "#075985" : primaryAccent}
          disabled={creating}
          action={() => {}}
        />
      </motion.div>
    </motion.form>
  );
}
