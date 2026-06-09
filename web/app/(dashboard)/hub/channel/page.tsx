import { redirect } from "next/navigation";

export default function HubChannelRedirectPage() {
  redirect("/hub/profile");
}
