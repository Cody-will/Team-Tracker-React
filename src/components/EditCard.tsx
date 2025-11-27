import { motion, AnimatePresence } from "motion/react";
import { useState, useMemo, useEffect } from "react";
import type { User, UpdateUserResult } from "../pages/context/UserContext";
import Button from "./Button";
import FileInput from "./FileInput";
import InfoCard from "./InfoCard";
import ProfilePhoto from "./ProfilePhoto";
import type { UploadTaskSnapshot } from "firebase/storage";
import type { ScheduleEvent, DayEvent } from "../pages/context/ScheduleContext";
import { useUser } from "../pages/context/UserContext";
import { useSchedule } from "../pages/context/ScheduleContext";
import EditForm from "./EditForm";
import InfoItem from "./InfoItem";
import ProfileBadge from "./ProfileBadge.tsx";
import { BsX } from "react-icons/bs";
import ProgressBar from "./ProgressBar.tsx";
import type { FormValues } from "./EditForm";
import type { ErrorNotify } from "../pages/Vacation.tsx";

export interface EditProps {
  user: User;
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<any>>;
  setNotify: React.Dispatch<React.SetStateAction<ErrorNotify | null>>;
}

type EventType = "Vacation" | "Training" | "Shift-Swap";

export default function EditCard({
  user,
  selected,
  setSelected,
  setNotify,
}: EditProps) {
  const { userSettings, setProfilePhoto, removeProfilePhoto, updateUser } =
    useUser(); // ← add new methods
  const { primaryAccent, secondaryAccent } = userSettings;
  const { events, coverage } = useSchedule();
  const layoutKey = `user-${user.badge}`;

  // upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  type BadgeKey = "fto" | "oic" | "pit" | "speed" | "rifle" | "trainee";
  const optionKeys = [
    "fto",
    "oic",
    "pit",
    "speed",
    "rifle",
    "trainee",
  ] as const;

  const inputStyle =
    "border-2 border-zinc-500 w-full text-zinc-200 bg-zinc-900 rounded-lg py-2 px-3 focus:border-[var(--accent)] focus:outline-none focus:ring-2 [--tw-ring-color:var(--accent)] focus:shadow-[0_0_15px_2px_var(--accent)]";

  const badges = useMemo(() => {
    return optionKeys
      .filter((k) => Boolean(user[k as BadgeKey]))
      .map((k) => (
        <ProfileBadge
          key={`${k}-${user.badge}`}
          title={k.toUpperCase()}
          color={secondaryAccent}
          styles="w-full px-2 py-1 font-semibold"
        />
      ));
  }, [user, secondaryAccent]);

  // create preview when a file is chosen
  function createPreview(file: File): void {
    setSelectedFile(file);
    setProgress(0);
    setUploading(false);
    setUploadPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  // cleanup preview URL
  useEffect(() => {
    return () => {
      if (uploadPreview) URL.revokeObjectURL(uploadPreview);
    };
  }, [uploadPreview]);

  function clearPreview() {
    if (uploadPreview) URL.revokeObjectURL(uploadPreview);
    setUploadPreview(null);
    setSelectedFile(null);
    setProgress(0);
    setUploading(false);
  }

  function updateProgress(snapshot: UploadTaskSnapshot): void {
    setProgress(
      Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
    );
  }

  // actually upload the new profile photo and replace old
  async function handleUpload() {
    if (!selectedFile || !user.uid) return;

    try {
      setProgress(0);
      await setProfilePhoto({
        uid: user.uid,
        file: selectedFile,
        onProgress: updateProgress,
      });
      clearPreview();
    } catch (err) {
      createNotification({
        key: "Error",
        title: "Oops!",
        message: "Upload failed",
        location: "top-center",
        timer: 3,
        onClose: closeNotification,
      });
      console.error("Upload failed:", err);
    }
  }

  // optional “Remove Photo” action
  async function handleRemovePhoto() {
    if (!user?.uid || uploading) return;
    try {
      setUploading(true);
      await removeProfilePhoto(user.uid!);
    } catch (e) {
      console.error("Remove photo failed:", e);
    } finally {
      setUploading(false);
    }
  }

  function createNotification(info: ErrorNotify) {
    setNotify(info);
  }

  function closeNotification() {
    setNotify(null);
  }

  function close() {
    setSelected("");
  }

  async function handleSubmit(data: FormValues): Promise<boolean> {
    console.log("pressed");
    const completed = await updateUser(data.uid, data);
    if (completed.success) {
      createNotification({
        key: "success",
        title: "Success",
        location: "top-center",
        message: "User successfully updated!",
        onClose: closeNotification,
        timer: 2,
      });
      return true;
    }

    if (!completed.success) {
      createNotification({
        key: "failure",
        title: `Oops! ${completed.code}`,
        location: "top-center",
        message: completed.message,
        onClose: closeNotification,
        timer: 5,
      });
      return false;
    }
    return false;
  }

  const showProgressBar = progress > 0 && progress < 100;

  return (
    <motion.div
      layoutId={layoutKey}
      style={{ borderColor: secondaryAccent }}
      className="relative flex p-4 gap-2 h-full w-full z-50 bg-zinc-900 border rounded-md"
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        onClick={close}
        transition={{ type: "tween", duration: 0.02 }}
        className="absolute p-2 top-0 left-0 text-zinc-200 hover:cursor-pointer"
      >
        <BsX size={64} />
      </motion.div>

      <div className="w-1/2 h-full flex gap-2 items-center justify-center flex-col">
        <div className="h-full w-full flex justify-center items-end">
          <div className="flex w-full justify-center items-center gap-2" />
        </div>

        <div className="flex gap-2 flex-col items-center justify-center">
          <ProfilePhoto
            user={user}
            size={48}
            borderColor={primaryAccent}
            borderSize={"lg"}
          />
          <div className="text-xl text-zinc-200 font-semibold">{`${user.lastName}, ${user.firstName}`}</div>
          <div className="flex w-full justify-center items-center gap-2">
            {badges}
          </div>
        </div>

        <div className="h-full w-full flex justify-between items-center flex-col gap-2">
          <motion.div
            style={{ borderColor: secondaryAccent }}
            animate={{
              height: uploadPreview ? "144px" : "100%",
              width: uploadPreview ? "144px" : "100%",
              borderRadius: uploadPreview ? "50%" : "10px",
              borderWidth: uploadPreview ? "4px" : "2px",
            }}
            transition={{ type: "tween", duration: 0.3 }}
            className="flex overflow-hidden justify-center items-center"
          >
            <AnimatePresence initial={false} mode="sync">
              {uploadPreview ? (
                <motion.img
                  key="preview"
                  src={uploadPreview}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-zinc-200 text-center flex items-center justify-center px-4"
                >
                  Preview: No image selected
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <FileInput
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            handlePreview={createPreview}
            color={primaryAccent}
          />
          {showProgressBar && (
            <ProgressBar progress={progress} accent={secondaryAccent} />
          )}
          <div className="w-full flex gap-2 items-center justify-center">
            <Button
              text="Disable User"
              action={() => {}}
              color={secondaryAccent}
            />
            <Button
              text="Upload Photo"
              action={handleUpload}
              color={uploading ? "#636363" : primaryAccent}
              disabled={uploading || !selectedFile}
            />
          </div>
        </div>
      </div>

      <div className="w-full h-full">
        <EditForm userProps={user} submitFunction={handleSubmit} />
      </div>

      <div className="w-full h-full flex flex-col gap-4">
        <InfoCard
          title="Vacation"
          props={getEvents(user, events, "Vacation")}
        />
        <InfoCard
          title="Shift Swaps / Coverage"
          props={[
            ...getEvents(user, events, "Shift-Swap"),
            ...getCover(user, coverage),
          ]}
        />
        <InfoCard
          title="Training"
          props={getEvents(user, events, "Training")}
        />
      </div>
    </motion.div>
  );
}

function getEvents(user: User, events: ScheduleEvent[], type: EventType) {
  return events.map(
    (event) =>
      event.originUID === user.uid &&
      event.eventType === type && <InfoItem key={event.id} event={event} />
  );
}

function getCover(user: User, coverage: DayEvent[]) {
  return coverage.map(
    (event) =>
      event.targetUID === user.uid &&
      event.claimed && <InfoItem key={event.id} coverage={event} />
  );
}
