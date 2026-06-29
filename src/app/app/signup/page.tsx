import { redirect } from "next/navigation";
import { APP_LOGIN_PATH } from "@/lib/app-auth-paths";

export default function AppSignupPage() {
  redirect(APP_LOGIN_PATH);
}
