"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PROJECT_TEMPLATES } from "./constants";

const formSchema = z.object({
  value: z
    .string()
    .min(1, { message: "Message is required" })
    .max(1000, { message: "Message is too long!" }),
});
export const ProjectForm = () => {
  const router = useRouter()
  const trpc = useTRPC();
  const queryClient = useQueryClient()
  const createProject = useMutation(trpc.projects.create.mutationOptions({
    onSuccess: (data)=>{
        queryClient.invalidateQueries(
            trpc.projects.getMany.queryOptions()
        )
        queryClient.invalidateQueries(
            trpc.usage.status.queryOptions()
        )

        router.push(`/projects/${data.id}`)
    },
    onError: (error)=>{
        toast.error(error.message)
        if (error.data?.code === 'UNAUTHORIZED'){
          // clerk.openSignIn();
          router.push(`sign-in`)
        }
        if (error.data?.code == 'TOO_MANY_REQUESTS'){
          router.push("/pricing")
        }
    }
  }));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createProject.mutateAsync({
      value: values.value,
    });
  };
 
  const onSelect = (template:string)=>{
    form.setValue("value",template,{
      shouldDirty:true,
      shouldTouch:true,
      shouldValidate:true
    })
  }

  const [isFocused, setIsFocused] = useState(false);
  const isPending = createProject.isPending;
  const isDisabled = isPending || !form.formState.isValid;

  return (
    <Form {...form}>
      <section className="space-y-6">
        <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
          isFocused && "shadow=xs",
        )}
      >
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <TextareaAutosize
              {...field}
              disabled={isPending}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              minRows={2}
              maxRows={8}
              className="pt-4 resize-none border-none w-full outline-none bg-transparent"
              placeholder="What would you like to build?"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  form.handleSubmit(onSubmit)(e);
                }
              }}
            />
          )}
        />

        <div className="flex gap-x-2 items-end justify-between pt-2">
          <div className="text-[10px] text-muted-foreground font-mono">
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span>&#8984;</span>Enter
            </kbd>
            &nbsp;to submit
          </div>
          <Button
            disabled={isDisabled}
            className={cn(
              "size-8 rounded-full",
              isDisabled && "bg-muted-foreground border"
            )}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <ArrowUpIcon />
            )}
          </Button>
        </div>
      </form>
      <div className="flex-wrap justify-center gap-2 hidden mt-2 md:flex max-w-3xl">
            {PROJECT_TEMPLATES.map((template)=>(
                <Button
                    key={template.title}
                    variant={'outline'}
                    size={'sm'}
                    className="bg-white dark:bg-sidebar"
                    onClick={()=>onSelect(template.prompt)}
                >
                    {template.emoji} {template.title}
                </Button>
            ))}
      </div>
      </section>
    </Form>
  );
};
