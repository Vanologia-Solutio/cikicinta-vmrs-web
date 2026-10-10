import { LoginForm } from "@/components/login-form";
import { cn } from "@/lib/utils";
import { PAGE_ANIMATE_IN, PROJECT_NAME } from "@/shared/constants/common";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className={cn(PAGE_ANIMATE_IN, "grid min-h-svh lg:grid-cols-2")}>
      <div className="my-auto flex animate-in flex-col p-6 duration-500 fade-in md:p-10">
        <div className="mx-auto mb-4">
          <Image
            src="/images/logo-ori.png"
            alt={PROJECT_NAME}
            width={86}
            height={72}
            className="h-18 w-auto"
            priority
          />
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/images/beach-drone.jpg"
          className="object-cover"
          alt="Beach Drone"
          fill
          sizes="100vw 100vh"
          priority
        />
      </div>
    </div>
  );
}
