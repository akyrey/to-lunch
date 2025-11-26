import Link from "next/link"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { UtensilsCrossed, Trophy, History, LogOut } from "lucide-react"
import { MobileMenu } from "@/components/mobile-menu"

export async function Navbar() {
    const session = await auth()

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
            <div className="container flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
                    <div className="p-2 rounded-lg bg-primary/20 text-primary">
                        <UtensilsCrossed className="h-5 w-5" />
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        LunchVote
                    </span>
                </Link>

                {session?.user && (
                    <>
                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-6">
                            <div className="flex items-center gap-1">
                                <Link href="/places">
                                    <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                                        Places
                                    </Button>
                                </Link>
                                <Link href="/history">
                                    <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                                        <History className="mr-2 h-4 w-4" />
                                        History
                                    </Button>
                                </Link>
                                <Link href="/leaderboard">
                                    <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                                        <Trophy className="mr-2 h-4 w-4" />
                                        Leaderboard
                                    </Button>
                                </Link>
                            </div>

                            <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-medium leading-none text-white">
                                        {session.user.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {/* @ts-ignore */}
                                        {session.user.points || 0} pts
                                    </span>
                                </div>
                                <form action={async () => {
                                    "use server"
                                    const { signOut } = await import("@/lib/auth")
                                    await signOut()
                                }}>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                        <LogOut className="h-5 w-5" />
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* Mobile Menu */}
                        <MobileMenu user={session.user} />
                    </>
                )}
            </div>
        </nav >
    )
}
