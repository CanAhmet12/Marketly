import { redirect } from "next/navigation";

/** Eski 7 adımlı sihirbaz → yeni premium setup */
export default function OnboardingLegacyRedirect() {
  redirect("/onboarding/setup");
}
