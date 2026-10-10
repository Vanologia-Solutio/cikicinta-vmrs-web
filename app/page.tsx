import { HOME_ROUTE } from "@/shared/constants/common";
import { redirect } from "next/navigation";

export default function Home() {
  redirect(HOME_ROUTE);
}
