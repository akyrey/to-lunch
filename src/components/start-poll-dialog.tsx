"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { createPoll } from "@/app/actions"
import { Loader2, Check, Utensils } from "lucide-react"
import { cn } from "@/lib/utils"

interface Place {
    id: string
    name: string
    description: string | null
}

interface StartPollDialogProps {
    places: Place[]
    trigger?: React.ReactNode
}

export function StartPollDialog({ places, trigger }: StartPollDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>(places.map(p => p.id))

    async function handleStartPoll() {
        setIsLoading(true)
        try {
            await createPoll(selectedPlaceIds)
            setOpen(false)
        } catch (error) {
            console.error("Failed to start poll", error)
        } finally {
            setIsLoading(false)
        }
    }

    const togglePlace = (id: string) => {
        setSelectedPlaceIds(prev =>
            prev.includes(id)
                ? prev.filter(pId => pId !== id)
                : [...prev, id]
        )
    }

    const toggleAll = () => {
        if (selectedPlaceIds.length === places.length) {
            setSelectedPlaceIds([])
        } else {
            setSelectedPlaceIds(places.map(p => p.id))
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" className="rounded-full shadow-lg hover:shadow-primary/25">
                        Start New Poll
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Start a Lunch Poll</DialogTitle>
                    <DialogDescription>
                        Select the places you want to include in this vote.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex justify-end mb-2">
                    <Button variant="ghost" size="sm" onClick={toggleAll} className="text-xs">
                        {selectedPlaceIds.length === places.length ? "Deselect All" : "Select All"}
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-2 min-h-[200px]">
                    {places.map((place) => {
                        const isSelected = selectedPlaceIds.includes(place.id)
                        return (
                            <div
                                key={place.id}
                                onClick={() => togglePlace(place.id)}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                                    isSelected 
                                        ? "border-primary bg-primary/5" 
                                        : "border-transparent hover:bg-muted"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-8 w-8 rounded-full flex items-center justify-center transition-colors",
                                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                    )}>
                                        <Utensils className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="font-medium">{place.name}</div>
                                        {place.description && (
                                            <div className="text-xs text-muted-foreground line-clamp-1">{place.description}</div>
                                        )}
                                    </div>
                                </div>
                                {isSelected && <Check className="h-4 w-4 text-primary" />}
                            </div>
                        )
                    })}
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleStartPoll} 
                        disabled={isLoading || selectedPlaceIds.length === 0}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Starting...
                            </>
                        ) : (
                            `Start Poll (${selectedPlaceIds.length})`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
