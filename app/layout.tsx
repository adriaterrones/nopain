import "./globals.css"
import Link from "next/link"
import { ThemeProvider } from "./providers/ThemeProvider"
import { ThemeToggle } from "./components/ThemeToggle"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"
import { Poppins } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata = {
  title: "NoPain",
  description: "Encuentra tu clínica de fisioterapia ideal",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={poppins.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* NAVBAR */}
          <header className="border-b border-border backdrop-blur-md sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-5">
              <Link
                href="/"
                className="text-3xl font-bold tracking-tight text-primary select-none"
              >
                NoPain
              </Link>

              <NavigationMenu>
                <NavigationMenuList className="flex items-center gap-8 text-lg font-medium">
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/clinics"
                        className="hover:text-primary transition-colors"
                      >
                        Clínicas
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/dashboard"
                        className="hover:text-primary transition-colors"
                      >
                        Dashboard
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/login"
                        className="hover:text-primary transition-colors"
                      >
                        Login
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              <ThemeToggle />
            </div>
          </header>

          {/* CONTENIDO PRINCIPAL */}
          <main className="max-w-6xl mx-auto p-8">{children}</main>

          {/* FOOTER */}
          <footer className="mt-16 text-center text-sm text-muted-foreground py-8 border-t border-border">
            © {new Date().getFullYear()} NoPain — Todos los derechos reservados.
          </footer>

          {/* TOASTER de shadcn/ui */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
