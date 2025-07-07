import { inngest } from "./client";
import {Agent, anthropic, createAgent} from '@inngest/agent-kit'
import {Sandbox} from '@e2b/code-interpreter'
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("Create Sandbox", async () => {
        const sandbox = await Sandbox.create("viiberr-nextjs-test")
        return sandbox.sandboxId
    })
    
    const codeAgent = createAgent({
        name: "code-agent",
        system:"You are an exprt next.js developer. You write readbale , maintainable and efficient code. You are also an expert in TypeScript, React, Tailwind CSS and other modern web technologies.",
        model: anthropic({model: "claude-3-5-haiku-latest", defaultParameters:{
            max_tokens:1000,
        } }),
    });

    const {output} = await codeAgent.run(
        `Write the following snippet: ${event.data.text}`
    );

    const sandboxURL = await step.run("get-sandbpx-url", async ()=>{
        const sandbox = await getSandbox(sandboxId)
        const host = sandbox.getHost(3000)
        return `http://${host}`
    }) 

    return {output, sandboxURL}

});
