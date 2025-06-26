"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { SessionProvider } from "next-auth/react"
import { ShoppingProvider } from "@/app/hooks/useShoppingContext"
import { Toaster } from "react-hot-toast"

export function Providers({
    children,
    session,
}: {
    children: React.ReactNode;
    session: any;
}) {
    return (
        <SessionProvider session={session}>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <ShoppingProvider>
                    {children}
                    <Toaster position="top-right" />
                </ShoppingProvider>
            </ThemeProvider>
        </SessionProvider>
    )
} 