'use client'

import { ModuleLayout, useHeader, HeaderContext } from '@/app/components/module-layout'
import { MODULES } from '@/lib/modules'

export { useHeader, HeaderContext }

// Layout do modulo corporativo com sidebar e header
// Layout do modulo corporativo com sidebar e header
export default function CorporativoLayout({ children }: { children: React.ReactNode }) {
  return <ModuleLayout module={MODULES.corporativo}>{children}</ModuleLayout>
}
