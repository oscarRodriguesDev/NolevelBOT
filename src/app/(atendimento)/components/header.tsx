'use client'
import { LuHardHat } from 'react-icons/lu'
import { ThemeToggle } from '@/app/components/theme-toggle'

export function Header() {

    return (
        <div
            className="border-b p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 transition-colors duration-300"
            style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border-subtle)",
            }}
        >
             <ThemeToggle />
            <div className="max-w-7xl mx-auto flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg flex-shrink-0" style={{ backgroundColor: "var(--primary)" }}>
                    <LuHardHat className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0">
                    <h1 className="text-base sm:text-lg lg:text-xl font-bold uppercase tracking-tight">
                        Nolevel Suporte
                    </h1>
                    <p className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase opacity-70" style={{ color: "var(--primary)" }}>
                        Setor de Operações
                    </p>
                </div>
            </div>
        </div>


    )

}
