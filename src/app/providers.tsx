'use client'

import {HeroUIProvider, ToastProvider} from '@heroui/react'
import { AuthProvider } from '@/contexts/AuthContext'

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ToastProvider />
      <AuthProvider>
        {children}
      </AuthProvider>
    </HeroUIProvider>
  )
}
