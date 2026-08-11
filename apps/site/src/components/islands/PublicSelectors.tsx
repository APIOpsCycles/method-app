import { PillList, ResourceSelector } from "apiops-design-system/react";

type LinkedItem = { id: string; href: string };

const navigate = (items: LinkedItem[], id: string) => {
  const item = items.find((candidate) => candidate.id === id);
  if (item) window.location.assign(item.href);
};

export function PublicPillList({ items, label }: { items: Array<LinkedItem & { label: string }>; label: string }) {
  return <PillList items={items} label={label} onSelect={(id) => navigate(items, id)} />;
}

export function PublicResourceSelector({ items, emptyLabel }: { items: Array<LinkedItem & { type: string; title: string; description: string }>; emptyLabel: string }) {
  return <ResourceSelector items={items} emptyLabel={emptyLabel} />;
}
