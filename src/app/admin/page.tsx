import { redirect } from "next/navigation";
import { studioConsolePath } from "@/lib/studio-access";

export default function AdminPage() {
  redirect(studioConsolePath() || "/");
}
