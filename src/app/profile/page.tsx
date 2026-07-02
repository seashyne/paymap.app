import { redirect } from "next/navigation";

// v0.4: /profile redirects to /settings (consolidated)
export default function ProfilePage() {
  redirect("/settings");
}
