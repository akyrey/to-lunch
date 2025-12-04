"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth, signIn } from "@/lib/auth";

export async function handleGoogleLogin() {
  await signIn("google", { redirectTo: "/" });
}

export async function createPoll() {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Check if there is already an active poll
  const activePoll = await prisma.poll.findFirst({
    where: { active: true },
  });

  if (activePoll) {
    throw new Error("There is already an active poll");
  }

  // Create new poll
  const poll = await prisma.poll.create({
    data: {
      date: new Date(),
      active: true,
    },
  });

  // Add all places as options to the poll (for now, add all. Later can select)
  const places = await prisma.place.findMany();

  for (const place of places) {
    await prisma.pollOption.create({
      data: {
        pollId: poll.id,
        placeId: place.id,
      },
    });
  }

  revalidatePath("/");
}

export async function vote(pollOptionId: string, note?: string) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user already voted in this poll
  // First get the pollOption to get the pollId
  const pollOption = await prisma.pollOption.findUnique({
    where: { id: pollOptionId },
    include: { poll: true },
  });

  if (!pollOption) throw new Error("Option not found");
  if (!pollOption.poll.active) throw new Error("Poll is closed");

  // Check if user voted in this poll
  const existingVote = await prisma.vote.findFirst({
    where: {
      userId: user.id,
      pollOption: {
        pollId: pollOption.poll.id,
      },
    },
  });

  if (existingVote) {
    // Optional: Allow changing vote? For now, throw error or just update
    // Let's update the vote
    await prisma.vote.delete({ where: { id: existingVote.id } });
  }

  await prisma.vote.create({
    data: {
      userId: user.id,
      pollOptionId,
      note,
    },
  });

  // Award points for voting (e.g., 1 point)
  if (!existingVote) {
    await prisma.user.update({
      where: { id: user.id },
      data: { points: { increment: 1 } },
    });
  }

  revalidatePath("/");
}

export async function closePoll(pollId: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN")
    throw new Error("Unauthorized");

  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: {
      options: {
        include: {
          votes: true,
          place: true,
        },
      },
    },
  });

  if (!poll) throw new Error("Poll not found");

  // Calculate winner
  let winnerOption = null;
  let maxVotes = -1;

  for (const option of poll.options) {
    if (option.votes.length > maxVotes) {
      maxVotes = option.votes.length;
      winnerOption = option;
    }
  }

  await prisma.poll.update({
    where: { id: pollId },
    data: { active: false },
  });

  if (winnerOption && winnerOption.place.addedById) {
    // Award points to the user who added the winning place
    // e.g. 10 points + 1 point per vote received
    const points = 10 + winnerOption.votes.length;

    await prisma.user.update({
      where: { id: winnerOption.place.addedById },
      data: { points: { increment: points } },
    });
  }

  revalidatePath("/");
}

export async function deletePoll(pollId: string) {
  const session = await auth();
  if (!session?.user?.email || session.user.role !== "ADMIN")
    throw new Error("Unauthorized");

  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
  });

  if (!poll) throw new Error("Poll not found");

  if (poll.active) {
    // Optional: Allow deleting active polls? User said "if it hasn't been closed yet"
    // "admins should be able to delete an existing poll, if it hasn't been closed yet"
    // So only active polls can be deleted? Or maybe "even if it hasn't been closed yet"?
    // "delete an existing poll, if it hasn't been closed yet" implies IF active THEN delete.
    // If closed, maybe keep it for history?
    // Let's assume they can delete active polls.
  } else {
    // If closed, maybe they shouldn't delete it?
    // "if it hasn't been closed yet" -> implies restriction.
    throw new Error("Cannot delete a closed poll");
  }

  await prisma.poll.delete({
    where: { id: pollId },
  });

  revalidatePath("/");
}
