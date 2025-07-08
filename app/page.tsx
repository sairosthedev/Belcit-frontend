import Image from "next/image"
import { LoginForm } from "@/components/auth/login-form"

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/BT.png"
          alt="Background"
          fill
          style={{ objectFit: 'cover' }}
          className="opacity-40 dark:opacity-30"
          priority
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 opacity-80" />
      </div>
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16 ">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/placeholder-logo.png"
            alt="BELCIT Trading Logo"
            width={80}
            height={80}
            className="rounded-full shadow-lg border border-slate-200 dark:border-slate-800 bg-white p-2"
            priority
          />
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-fuchsia-600 to-emerald-500 drop-shadow-lg dark:from-blue-400 dark:via-fuchsia-400 dark:to-emerald-300 sm:text-6xl text-center">
            BELCIT TRADING
          </h1>
        </div>
        <div className="mt-8 w-full max-w-md">
          <div className="rounded-2xl bg-white/80 dark:bg-slate-950/80 shadow-2xl p-8 backdrop-blur-md border border-slate-200 dark:border-slate-800 transition hover:scale-[1.02] hover:shadow-3xl">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
