'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function addPlace(formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) {
        throw new Error("Unauthorized")
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string

    if (!name) {
        throw new Error("Name is required")
    }

    // Find user by email to get ID
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        throw new Error("User not found")
    }

    await prisma.place.create({
        data: {
            name,
            description,
            addedById: user.id,
        },
    })

    // Award points for proposing a place (e.g., 5 points)
    await prisma.user.update({
        where: { id: user.id },
        data: { points: { increment: 5 } },
    })

    revalidatePath("/places")
}

export async function deletePlace(id: string) {
    const session = await auth()
    if (!session?.user?.email) {
        throw new Error("Unauthorized")
    }

    await prisma.place.delete({
        where: { id },
    })

    revalidatePath("/places")
}
