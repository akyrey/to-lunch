'use client'

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { addPlace } from "./actions"
import { useState } from "react"
import { Plus, Loader2, MapPin } from "lucide-react"

export function AddPlaceDialog() {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            await addPlace(formData)
            setOpen(false)
        } catch (error) {
            console.error("Failed to add place", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-full shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105">
                    <Plus className="mr-2 h-4 w-4" /> Add Place
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass border-white/10">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <MapPin className="h-5 w-5" />
                        </div>
                        Add Lunch Place
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        Suggest a new spot for the team. You'll get points for adding it!
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                            Name
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="e.g. Burger King"
                            className="bg-background/50 border-white/10 focus:border-primary/50 transition-colors"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description" className="text-sm font-medium">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="e.g. Best burgers in town, cheap and fast."
                            className="bg-background/50 border-white/10 focus:border-primary/50 transition-colors min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="w-full rounded-full shadow-lg hover:shadow-primary/25">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                "Add Place"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
