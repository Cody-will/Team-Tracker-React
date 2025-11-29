import { useUser } from "../context/UserContext";

export function useSafeSettings() {
  const { defaultSettings, userSettings, loading } = useUser();
  if (!userSettings) {
    return { ...defaultSettings, loading: true };
  }

  return { ...userSettings, loading };
}
