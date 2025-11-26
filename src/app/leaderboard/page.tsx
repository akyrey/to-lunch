import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Award } from "lucide-react"

export default async function LeaderboardPage() {
    const users = await prisma.user.findMany({
        orderBy: { points: 'desc' },
    })

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">Leaderboard</h1>
                <p className="text-muted-foreground text-lg">
                    Who is the lunch champion?
                </p>
            </div>

            <Card className="border-white/10 glass overflow-hidden shadow-2xl">
                <CardHeader className="bg-primary/5 border-b border-white/5 pb-6">
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-yellow-500" />
                        Top Contributors
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {users.map((user: any, index: number) => {
                        let rankIcon = null
                        let rankClass = "text-muted-foreground font-medium"

                        if (index === 0) {
                            rankIcon = <Trophy className="h-6 w-6 text-yellow-500 animate-pulse-glow" />
                            rankClass = "text-yellow-500 font-bold text-xl"
                        } else if (index === 1) {
                            rankIcon = <Medal className="h-6 w-6 text-gray-400" />
                            rankClass = "text-gray-400 font-bold text-lg"
                        } else if (index === 2) {
                            rankIcon = <Medal className="h-6 w-6 text-amber-700" />
                            rankClass = "text-amber-700 font-bold text-lg"
                        } else {
                            rankIcon = <span className="w-6 text-center">{index + 1}</span>
                        }

                        return (
                            <div
                                key={user.id}
                                className={`flex items-center justify-between p-6 border-b border-white/5 last:border-0 hover:bg-primary/5 transition-colors ${index === 0 ? 'bg-yellow-500/5' : ''}`}
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-8 flex justify-center ${rankClass}`}>
                                        {rankIcon}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Avatar className={`h-12 w-12 border-2 ${index === 0 ? 'border-yellow-500' : 'border-border'}`}>
                                            <AvatarImage src={user.image} />
                                            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-semibold text-lg flex items-center gap-2">
                                                {user.name}
                                                {index === 0 && <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30 text-xs">Champion</Badge>}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Lunch Enthusiast
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold tabular-nums">{user.points}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Points</div>
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
    )
}

import { Badge } from "@/components/ui/badge"
