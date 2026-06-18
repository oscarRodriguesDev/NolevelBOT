'use client'

import { ModuleLayout, useHeader, HeaderContext } from '@/app/components/module-layout'
import { MODULES } from '@/lib/modules'

export { useHeader, HeaderContext }

export default function OficinaLayout({ children }: { children: React.ReactNode }) {
  return <ModuleLayout module={MODULES.oficina}>{children}</ModuleLayout>
}
