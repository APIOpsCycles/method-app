import type { APIRoute, GetStaticPaths } from "astro";
import { localizedLocales, type Locale } from "../../lib/method-data";
import { fullMethodMarkdown } from "../../lib/method-markdown";

export const getStaticPaths: GetStaticPaths = () => localizedLocales.map((locale) => ({ params: { locale } }));
export const GET: APIRoute = ({ params }) => new Response(fullMethodMarkdown(params.locale as Locale), {
  headers: { "Content-Type": "text/plain; charset=utf-8" },
});
