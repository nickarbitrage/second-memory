export const ONBOARDING_STORAGE_KEY = "secondmemory-onboarding";
const LEGACY_ONBOARDING_KEY = "meetmind-onboarding";

export type OnboardingData = {
  completed: boolean;
  name?: string;
  role?: string;
  goal?: string;
};

export function readOnboarding(): OnboardingData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      localStorage.getItem(ONBOARDING_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_ONBOARDING_KEY);
    return raw ? (JSON.parse(raw) as OnboardingData) : null;
  } catch {
    return null;
  }
}

export function markOnboardingComplete(extra?: Partial<OnboardingData>) {
  const payload: OnboardingData = {
    completed: true,
    ...extra,
  };
  localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(payload));
}

export function shouldSkipOnboarding(email?: string | null) {
  return email === "demo@meetmind.ai";
}
