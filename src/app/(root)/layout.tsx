import { Footer } from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Suspense } from "react";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <Suspense fallback={null}>
                <Navbar />
            </Suspense>
            <main>
                {children}
            </main>

            <Footer />

        </div>
    )
}