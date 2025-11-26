"use client"

import { useOptimistic, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, MapPin } from "lucide-react"
import { vote } from "@/app/actions"

type PollOption = {
    id: string
    place: {
        name: string
        description: string | null
    }
    votes: { userId: string }[]
}

type PollListProps = {
    options: PollOption[]
    userId: string
}

export function PollList({ options, userId }: PollListProps) {
    const [isPending, startTransition] = useTransition()

    const [optimisticOptions, addOptimisticVote] = useOptimistic(
        options,
        (state, newVoteOptionId: string) => {
            return state.map((option) => {
                // Remove existing vote if any
                const hasVoted = option.votes.some((v) => v.userId === userId)
                let newVotes = option.votes

                if (hasVoted) {
                    newVotes = option.votes.filter((v) => v.userId !== userId)
                }

                // Add new vote if this is the selected option
                if (option.id === newVoteOptionId) {
                    // If we are toggling the same vote, we already removed it above. 
                    // But the current logic in actions.ts seems to just toggle/re-add.
                    // Let's assume we want to switch vote or add vote.
                    // If the user clicked the SAME option they already voted for, 
                    // the action might toggle it off or keep it. 
                    // Looking at actions.ts: if existingVote, delete it. Then create new vote.
                    // So if I click the same one, it effectively re-votes (delete then create).
                    // Wait, if I click the SAME one, `existingVote` is found, deleted. Then `create` happens.
                    // So it's not a toggle off. It's a "confirm vote" or "re-vote".
                    // Actually, if I click a DIFFERENT one, `existingVote` (for the old option) is found?
                    // No, `findFirst` in `vote` action checks for `userId` and `pollOption.poll.id`.
                    // So it finds ANY vote by this user in this POLL.
                    // So yes, it switches the vote.

                    newVotes = [...newVotes, { userId }]
                }

                return {
                    ...option,
                    votes: newVotes
                }
            })
        }
    )

    const totalVotes = optimisticOptions.reduce((acc, curr) => acc + curr.votes.length, 0) || 1

    const handleVote = (optionId: string) => {
        startTransition(async () => {
            addOptimisticVote(optionId)
            await vote(optionId)
        })
    }

    return (
        <div className="space-y-6">
            {optimisticOptions.map((option) => {
                const hasVoted = option.votes.some((v) => v.userId === userId)
                const voteCount = option.votes.length

                return (
                    <div
                        key={option.id}
                        className={`relative group rounded-xl border p-4 transition-all duration-300 ${hasVoted
                            ? "bg-primary/10 border-primary/50 shadow-md"
                            : "bg-card/50 border-border hover:border-primary/30 hover:bg-card/80"
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`p-2 rounded-lg ${hasVoted
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                                        } transition-colors`}
                                >
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{option.place.name}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                        {option.place.description}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <span className="text-2xl font-bold">{voteCount}</span>
                                    <span className="text-xs text-muted-foreground block uppercase tracking-wider">
                                        Votes
                                    </span>
                                </div>
                                <Button
                                    variant={hasVoted ? "default" : "outline"}
                                    size="sm"
                                    className={`rounded-full px-6 touch-manipulation border ${hasVoted
                                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 hover:bg-primary hover:scale-100 active:scale-100"
                                        : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground hover:border-primary/50 hover:scale-100 active:scale-100"
                                        }`}
                                    disabled={hasVoted}
                                    onClick={() => handleVote(option.id)}
                                >
                                    {hasVoted ? (
                                        <>
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Voted
                                        </>
                                    ) : (
                                        "Vote"
                                    )}
                                </Button>
                            </div>
                        </div>
                        {/* Progress bar visual */}
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-3">
                            <div
                                className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                                style={{
                                    width: `${(voteCount / totalVotes) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
