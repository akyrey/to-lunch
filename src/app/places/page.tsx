import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic'
import { AddPlaceDialog } from "./add-place-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { deletePlace } from "./actions"
import { Button } from "@/components/ui/button"
import { MapPin, Trash2, Plus } from "lucide-react"
import { auth } from "@/lib/auth"

export default async function PlacesPage() {
    const session = await auth()
    const places = await prisma.place.findMany({
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Lunch Places</h1>
                    <p className="text-muted-foreground text-lg">
                        Manage the list of available lunch spots.
                    </p>
                </div>
                <AddPlaceDialog />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {places.map((place: any) => (
                    <Card key={place.id} className="group hover:shadow-xl transition-all duration-300 border-white/10 glass overflow-hidden">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                {session?.user?.id === place.addedById && (
                                    <form action={deletePlace.bind(null, place.id)}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2 -mt-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                )}
                            </div>
                            <CardTitle className="text-xl">{place.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-base leading-relaxed">
                                {place.description || "No description provided."}
                            </CardDescription>
                        </CardContent>
                    </Card>
                ))}

                {places.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-muted rounded-xl bg-muted/5">
                        <div className="p-4 rounded-full bg-muted mb-4">
                            <MapPin className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">No places added yet</h3>
                        <p className="text-muted-foreground mb-6">Be the first to propose a lunch spot!</p>
                        <AddPlaceDialog />
                    </div>
                )}
            </div>
        </div>
    )
}
