'use client'
import { LuHardHat } from 'react-icons/lu'
import { ThemeToggle } from '@/app/components/theme-toggle'

export function Header() {

    return (
        <div
            className="border-b p-8 mb-8 transition-colors duration-300"
            style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border-subtle)",
            }}
        >
             <ThemeToggle />
            <div className="max-w-md mx-auto flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--primary)" }}>
                    <LuHardHat className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-black uppercase tracking-tighter">
                        Nolevel Suporte
                    </h1>
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "var(--primary)" }}>
                        Setor de Operações
                    </p>
                </div>
            </div>
        </div>


    )

}