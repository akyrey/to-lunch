"use client"

import { useOptimistic, useTransition, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, MapPin } from "lucide-react"
import { vote } from "@/app/actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

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
    pollId: string
    userRole: string
    isPollActive: boolean
}

export function PollList({ options, userId, pollId, userRole, isPollActive }: PollListProps) {
    const [isPending, startTransition] = useTransition()
    
    const [optimisticOptions, addOptimisticVote] = useOptimistic(
        options,
        (state, newVote: { optionId: string, note?: string }) => {
            return state.map((option) => {
                // Remove existing vote if any
                const hasVoted = option.votes.some((v) => v.userId === userId)
                let newVotes = option.votes

                if (hasVoted) {
                    newVotes = option.votes.filter((v) => v.userId !== userId)
                }

                // Add new vote if this is the selected option
                if (option.id === newVote.optionId) {
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

    // State for the note dialog
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [note, setNote] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleVoteClick = (optionId: string) => {
        setSelectedOption(optionId)
        setNote("")
        setIsDialogOpen(true)
    }

    const confirmVote = () => {
        if (!selectedOption) return

        startTransition(async () => {
            addOptimisticVote({ optionId: selectedOption, note })
            await vote(selectedOption, note)
            setIsDialogOpen(false)
        })
    }

    return (
        <div className="space-y-6">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add a note (optional)</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="note" className="mb-2 block">Note</Label>
                        <Textarea 
                            id="note" 
                            placeholder="e.g. I'm vegetarian today" 
                            value={note} 
                            onChange={(e) => setNote(e.target.value)} 
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={confirmVote}>Vote</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {optimisticOptions.map((option) => {
                const hasVoted = option.votes.some((v) => v.userId === userId)
                const voteCount = option.votes.length
                const showCount = !isPollActive || userRole === "ADMIN"

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
                                {showCount && (
                                    <div className="text-right">
                                        <span className="text-2xl font-bold">{voteCount}</span>
                                        <span className="text-xs text-muted-foreground block uppercase tracking-wider">
                                            Votes
                                        </span>
                                    </div>
                                )}
                                <Button
                                    variant={hasVoted ? "default" : "outline"}
                                    size="sm"
                                    className={`rounded-full px-6 touch-manipulation border ${hasVoted
                                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 hover:bg-primary hover:scale-100 active:scale-100"
                                        : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground hover:border-primary/50 hover:scale-100 active:scale-100"
                                        }`}
                                    disabled={hasVoted || !isPollActive}
                                    onClick={() => handleVoteClick(option.id)}
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
                        {/* Progress bar visual - only show if counts are shown */}
                        {showCount && (
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-3">
                                <div
                                    className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                                    style={{
                                        width: `${(voteCount / totalVotes) * 100}%`,
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
