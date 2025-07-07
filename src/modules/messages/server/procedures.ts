import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";

export const messageRouter = createTRPCRouter({
    getMany: baseProcedure
        .query(async () => {
            const messages = await prisma.message.findMany({
                orderBy:{
                    updatedAt: 'asc'
                }
            })

            return messages
        }),
    create: baseProcedure
        .input(
            z.object({
                value:z.string().min(1, {message:"Message is required"})
            })
        )
        .mutation(async ({input}) => {
            console.log(input.value)
            const newMessage = await prisma.message.create({
                data:{
                    content: input.value,
                    role: "USER",
                    type: "RESULT"
                }
            })

            await inngest.send({
                name: "codeAgent/invoke",
                data:{
                    text: input.value
                }
            })

            return newMessage
        })
})