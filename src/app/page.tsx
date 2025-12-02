import { auth } from "@/lib/auth"
export const dynamic = 'force-dynamic'
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { createPoll, vote, closePoll, handleGoogleLogin, deletePoll } from "./actions"
import { PollList } from "@/components/poll-list"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Utensils, CheckCircle2, PlusCircle, Trophy, Clock, MapPin } from "lucide-react"
import Link from "next/link"

export default async function Home() {
    const session = await auth()

    if (!session) {
        return (
            <div className="flex min-h-[80vh] flex-col items-center justify-center text-center space-y-8">
                <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-purple-600 opacity-75 blur-lg animate-pulse-glow"></div>
                    <div className="relative bg-card p-8 rounded-2xl border border-white/10 shadow-2xl glass">
                        <Utensils className="h-16 w-16 text-primary mx-auto mb-4 animate-float" />
                        <h1 className="text-5xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                            Lunch Vote
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-[600px] mx-auto mb-8">
                            Decide where to eat with your team. Gamified, fair, and fun.
                        </p>
                        <form action={handleGoogleLogin}>
                            <Button size="lg" className="mx-auto font-semibold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3 bg-white text-black hover:bg-gray-100 border border-gray-200">
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Sign in with Google
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }

    const activePoll = await prisma.poll.findFirst({
        where: { active: true },
        include: {
            options: {
                include: {
                    place: true,
                    votes: true,
                },
            },
        },
    })

    const user = await prisma.user.findUnique({
        where: { email: session.user?.email! },
    })

    return (
        <div className="space-y-10 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">
                        Hello, <span className="text-primary">{session.user?.name}</span>!
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Ready to decide lunch? You have <span className="font-bold text-foreground">{user?.points || 0} points</span>.
                    </p>
                </div>
                {/* Actions could go here */}
            </div>

            {activePoll ? (
                <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
                    <div className="space-y-6">
                        <Card className="border-primary/20 shadow-2xl glass overflow-hidden">
                            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-8">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-2xl flex items-center gap-2">
                                            <Clock className="h-6 w-6 text-primary" />
                                            Active Poll
                                        </CardTitle>
                                        <CardDescription className="text-base mt-1">
                                            Vote for your favorite place today!
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary" className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary border-primary/20">
                                        {new Date(activePoll.date).toLocaleDateString()}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-8 space-y-6">
                                <PollList options={activePoll.options} userId={user?.id!} />
                            </CardContent>
                            <CardFooter className="bg-muted/30 border-t border-white/5 py-6 flex justify-between items-center">
                                <p className="text-sm text-muted-foreground">
                                    Voting closes automatically or by admin.
                                </p>
                                {session.user?.role === "ADMIN" && (
                                    <div className="flex gap-2">
                                        <form action={deletePoll.bind(null, activePoll.id)}>
                                            <Button variant="outline" size="sm" className="rounded-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                                                Delete Poll
                                            </Button>
                                        </form>
                                        <form action={closePoll.bind(null, activePoll.id)}>
                                            <Button variant="destructive" size="sm" className="rounded-full shadow-lg hover:shadow-destructive/25">
                                                End Poll & Pick Winner
                                            </Button>
                                        </form>
                                    </div>
                                )}
                            </CardFooter>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="glass border-white/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PlusCircle className="h-5 w-5 text-secondary-foreground" />
                                    Quick Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Link href="/places" className="block">
                                    <Button variant="outline" className="w-full justify-start h-auto py-4 px-4 border-dashed border-2 hover:border-primary hover:bg-primary/5 group">
                                        <div className="bg-primary/10 p-2 rounded-full mr-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <PlusCircle className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <span className="font-semibold block">Add a Place</span>
                                            <span className="text-xs text-muted-foreground">Propose a new lunch spot (+5 pts)</span>
                                        </div>
                                    </Button>
                                </Link>
                                <Link href="/leaderboard" className="block">
                                    <Button variant="outline" className="w-full justify-start h-auto py-4 px-4 hover:border-primary hover:bg-primary/5 group">
                                        <div className="bg-yellow-500/10 text-yellow-600 p-2 rounded-full mr-3 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                                            <Trophy className="h-5 w-5" />
                                        </div>
                                        <div className="text-left">
                                            <span className="font-semibold block">Leaderboard</span>
                                            <span className="text-xs text-muted-foreground">Check who's winning</span>
                                        </div>
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-xl animate-pulse-glow"></div>
                        <div className="relative bg-card p-6 rounded-full border border-white/10 shadow-xl">
                            <Utensils className="h-16 w-16 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="max-w-md space-y-2">
                        <h2 className="text-3xl font-bold">No Active Poll</h2>
                        <p className="text-muted-foreground text-lg">
                            It's quiet... too quiet. Start a poll to get the team moving!
                        </p>
                    </div>
                    {session.user?.role === "ADMIN" ? (
                        <form action={createPoll}>
                            <Button size="lg" className="rounded-full px-8 py-6 text-lg shadow-xl hover:shadow-primary/25 hover:scale-105 transition-all duration-300">
                                Start Lunch Vote
                            </Button>
                        </form>
                    ) : (
                        <p className="text-muted-foreground">
                            Waiting for an admin to start a poll...
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
