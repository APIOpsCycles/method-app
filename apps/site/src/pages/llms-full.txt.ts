import type { APIRoute } from "astro";
import { fullMethodMarkdown } from "../lib/method-markdown";

export const GET: APIRoute = () => new Response(fullMethodMarkdown(), {
  headers: { "Content-Type": "text/plain; charset=utf-8" },
});
