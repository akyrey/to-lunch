"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UtensilsCrossed, Trophy, History, LogOut, Menu, MapPin, Vote } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from "react"
import { signOut } from "next-auth/react"

interface MobileMenuProps {
    user: {
        name?: string | null
        points?: number
    }
}

export function MobileMenu({ user }: MobileMenuProps) {
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary md:hidden">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] border-white/10 bg-black/95 backdrop-blur-xl">
                <SheetHeader className="mb-8 text-left">
                    <SheetTitle className="flex items-center gap-2 text-xl font-bold">
                        <div className="p-2 rounded-lg bg-primary/20 text-primary">
                            <UtensilsCrossed className="h-5 w-5" />
                        </div>
                        LunchVote
                    </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <Link href="/" onClick={() => setOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start text-lg font-medium text-muted-foreground hover:text-primary hover:bg-primary/10">
                                <Vote className="mr-2 h-5 w-5" />
                                Vote
                            </Button>
                        </Link>
                        <Link href="/places" onClick={() => setOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start text-lg font-medium text-muted-foreground hover:text-primary hover:bg-primary/10">
                                <MapPin className="mr-2 h-5 w-5" />
                                Places
                            </Button>
                        </Link>
                        <Link href="/history" onClick={() => setOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start text-lg font-medium text-muted-foreground hover:text-primary hover:bg-primary/10">
                                <History className="mr-2 h-5 w-5" />
                                History
                            </Button>
                        </Link>
                        <Link href="/leaderboard" onClick={() => setOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start text-lg font-medium text-muted-foreground hover:text-primary hover:bg-primary/10">
                                <Trophy className="mr-2 h-5 w-5" />
                                Leaderboard
                            </Button>
                        </Link>
                    </div>

                    <div className="border-t border-white/10 pt-6 mt-auto">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-white">
                                    {user.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {user.points || 0} pts
                                </span>
                            </div>
                        </div>
                        <div className="px-2">
                            <Button
                                variant="destructive"
                                className="w-full justify-start"
                                onClick={() => signOut()}
                            >
                                <LogOut className="mr-2 h-5 w-5" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
