import type { APIRoute, GetStaticPaths } from "astro";
import { locales } from "../lib/method-data";
import { methodDocuments } from "../lib/method-markdown";

export const getStaticPaths: GetStaticPaths = () => locales.flatMap((locale) =>
  methodDocuments(locale).map((document) => ({
    params: { path: document.path.slice(1, -3) }, props: { content: document.content },
  })));

export const GET: APIRoute = ({ props }) => new Response(props.content, {
  headers: { "Content-Type": "text/markdown; charset=utf-8" },
});
