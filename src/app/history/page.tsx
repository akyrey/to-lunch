import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Calendar, Trophy, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function HistoryPage() {
    const polls = await prisma.poll.findMany({
        where: { active: false },
        orderBy: { date: 'desc' },
        include: {
            options: {
                include: {
                    place: true,
                    votes: true,
                },
            },
        },
    })

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">Poll History</h1>
                <p className="text-muted-foreground text-lg">
                    See where the team has eaten in the past.
                </p>
            </div>

            <div className="space-y-6">
                {polls.map((poll: any) => {
                    // Calculate winner
                    const winner = poll.options.reduce((prev: any, current: any) => {
                        return (prev.votes.length > current.votes.length) ? prev : current
                    }, poll.options[0])

                    return (
                        <Card key={poll.id} className="group hover:shadow-xl transition-all duration-300 border-white/10 glass overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-white/5 pb-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-5 w-5" />
                                        <span className="font-medium">{format(new Date(poll.date), "MMMM d, yyyy")}</span>
                                    </div>
                                    <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                                        {poll.options.reduce((acc: number, curr: any) => acc + curr.votes.length, 0)} Votes
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                                        <Trophy className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">{winner?.place?.name || "No votes"}</h3>
                                        <p className="text-muted-foreground flex items-center gap-1 mt-1">
                                            <MapPin className="h-4 w-4" />
                                            {winner?.place?.description || "Winner"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-border/50">
                                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Runner ups</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {poll.options.filter((o: any) => o.id !== winner?.id).map((option: any) => (
                                            <div key={option.id} className="flex justify-between items-center p-2 rounded-lg bg-muted/30 text-sm">
                                                <span className="font-medium">{option.place.name}</span>
                                                <span className="text-muted-foreground">{option.votes.length} votes</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}

                {polls.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-muted rounded-xl bg-muted/5">
                        <div className="p-4 rounded-full bg-muted mb-4">
                            <History className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">No history yet</h3>
                        <p className="text-muted-foreground">Once a poll is closed, it will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function History({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" />
            <path d="M3 3v9h9" />
            <path d="M12 7v5l4 2" />
        </svg>
    )
}
