// import { useTRPC } from '@/trpc/client'
// import { useQuery } from '@tanstack/react-query';
import { trpc, getQueryClient } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Client } from "./client";
import { Suspense } from "react";

const Page = async () => {
  // This is client side fetching
  // const trpc = useTRPC();
  // const {data} =  useQuery(trpc.hello.queryOptions({text:"Atul!"}))
  // For server side fetching
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.hello.queryOptions({ text: "Atul!" }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
         <Client/>
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
