import { ShopProvider } from "@/app/hooks/shopContext";
import DashboardAside from "@/components/DashboardAside";
import DashboardNavbar from "@/components/DashboardNavbar";

const Layout = async ({ children }: { children: React.ReactNode }) => {
    return (
        <ShopProvider>
            <div className="h-screen flex flex-col bg-background">
                <nav className="h-30 border-b border-border shadow-sm bg-card">
                    <DashboardNavbar />
                </nav>

                <div className="flex flex-1 overflow-hidden">
                    <aside className="w-64 h-full border-r border-border shadow-sm bg-card">
                        <DashboardAside />
                    </aside>

                    <main className="flex-1 overflow-y-auto bg-muted/50 p-6">
                        {children}
                    </main>
                </div>
            </div>
        </ShopProvider>
    );
};

export default Layout;