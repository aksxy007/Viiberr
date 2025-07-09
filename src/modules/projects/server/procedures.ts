import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import {generateSlug} from 'random-word-slugs'
import { TRPCError } from "@trpc/server";

export const projectRouter = createTRPCRouter({
    getOne: baseProcedure
        .input(
            z.object({
                id: z.string().min(1, {message: "Project ID is required"})
            })
        )
        .query(async ({input}) => {
            const existingProject = await prisma.project.findMany({
                where:{
                    id: input.id
                },
                orderBy:{
                    updatedAt: 'asc'
                }
            })

            if (existingProject.length === 0) {
                throw new TRPCError({code: "NOT_FOUND", message:"Project not found"});
            }

            return existingProject[0]
        }),
    getMany: baseProcedure
        .query(async () => {
            const projects = await prisma.project.findMany({
                orderBy:{
                    updatedAt: 'asc'
                }
            })

            return projects
        }),

    create: baseProcedure
        .input(
            z.object({
                value:z.string().min(1, {message:"Message is required"}).max(1000, {message: "Message is too long!"})
            })
        )
        .mutation(async ({input}) => {
            const createdProject = await prisma.project.create({
                data:{
                    name: generateSlug(2, {format:"kebab"}),
                    messages:{
                        create:[{
                            content: input.value,
                            role: "USER",
                            type: "RESULT"
                        }]
                    } 
                }
            })
            
            await inngest.send({
                name: "codeAgent/invoke",
                data:{
                    text: input.value,
                    projectId: createdProject.id
                }
            })

            return createdProject
        })
})