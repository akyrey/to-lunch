import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// Server-Sent Events endpoint for real-time vote updates
export async function GET(request: NextRequest) {
  const pollId = request.nextUrl.searchParams.get("pollId");

  if (!pollId) {
    return new Response("Poll ID required", { status: 400 });
  }

  // Create a readable stream
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Function to send vote data
      const sendVotes = async () => {
        try {
          const poll = await prisma.poll.findUnique({
            where: { id: pollId },
            include: {
              options: {
                include: {
                  votes: {
                    select: {
                      userId: true,
                    },
                  },
                  place: {
                    select: {
                      name: true,
                      description: true,
                    },
                  },
                },
              },
            },
          });

          if (poll) {
            const data = JSON.stringify({
              options: poll.options,
              timestamp: Date.now(),
            });

            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        } catch (error) {
          console.error("Error fetching votes:", error);
        }
      };

      // Send initial data
      await sendVotes();

      // Poll for updates every 2 seconds
      const interval = setInterval(sendVotes, 2000);

      // Cleanup on client disconnect
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
