"use client";

import Image from "next/image"
import { LoginForm } from "@/components/auth/login-form"
import { ShoppingCart, Package, Users, BarChart3 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        <p className="text-sm text-muted-foreground">Connecting to server...</p>
        <p className="text-xs text-muted-foreground">If this takes too long, check your internet connection</p>
      </div>
    )
  }

  // Redirect if already authenticated
  if (user) {
    return null
  }
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.1),transparent_50%)]" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 opacity-20 dark:opacity-10">
        <ShoppingCart className="h-8 w-8 text-blue-500 animate-pulse" />
      </div>
      <div className="absolute top-32 right-32 opacity-20 dark:opacity-10">
        <Package className="h-6 w-6 text-green-500 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <div className="absolute bottom-32 left-32 opacity-20 dark:opacity-10">
        <Users className="h-7 w-7 text-purple-500 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      <div className="absolute bottom-20 right-20 opacity-20 dark:opacity-10">
        <BarChart3 className="h-6 w-6 text-indigo-500 animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16 z-10">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-slate-800 rounded-2xl blur-xl opacity-30 animate-pulse" />
            <div className="relative rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border-4 border-white dark:border-slate-700 p-6 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-center">
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-slate-800 dark:from-blue-400 dark:to-slate-300 tracking-tighter">
                  BT
                </span>
              </div>
            </div>
          </div>

          {/* Company Name */}
          <div className="text-center space-y-3">
            <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-600 to-slate-800 dark:from-slate-100 dark:via-blue-400 dark:to-slate-300 sm:text-6xl">
              BELCIT TRADING
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-slate-800 mx-auto rounded-full" />
            <p className="text-lg text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider">
              Management System
            </p>
            <div className="flex items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Enterprise Grade</span>
              </div>
              <div className="w-1 h-1 bg-slate-400 rounded-full" />
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Secure Portal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="mt-8 w-full max-w-md">
          <div className="group relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-slate-700 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />
            
            {/* Main form container */}
            <div className="relative rounded-2xl bg-white/98 dark:bg-slate-900/98 shadow-2xl p-10 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 hover:shadow-3xl">
              {/* Form header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-slate-800 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">BT</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                   Portal
                  </h2>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Access your management dashboard
                </p>
              </div>

              <LoginForm />

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full" />
                    <span>Encrypted Connection</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-400 rounded-full" />
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-green-500 rounded-full" />
                    <span>© 2025 Belcit Trading</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
          <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm border border-slate-200/30 dark:border-slate-700/30 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300">
            <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Inventory</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm border border-slate-200/30 dark:border-slate-700/30 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300">
            <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Sales</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm border border-slate-200/30 dark:border-slate-700/30 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300">
            <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Analytics</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm border border-slate-200/30 dark:border-slate-700/30 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300">
            <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Staff</span>
          </div>
        </div>
      </div>
    </div>
  )
}