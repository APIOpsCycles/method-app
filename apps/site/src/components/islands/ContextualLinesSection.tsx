import { useEffect } from "react";
import { LinesSection, type LineSectionItem } from "@apiops/design-system/react";
import { initializeMethodContext, useMethodContext } from "../../lib/method-context";
import { linePathForContext } from "../../lib/line-routes";

type LineItem = Omit<LineSectionItem, "href"> & { slug: string };
type CycleItem = { id: string; slug: string };

export default function ContextualLinesSection({ title, items, cycles, prefix }: { title: string; items: LineItem[]; cycles: CycleItem[]; prefix: string }) {
  const context = useMethodContext();
  useEffect(() => { initializeMethodContext(); }, []);
  return <LinesSection title={title} items={items.map((item) => ({
    ...item,
    href: linePathForContext(prefix, item, cycles, context),
  }))} />;
}
