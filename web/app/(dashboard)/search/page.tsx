import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ q?: string; tab?: string }>;
};

/** Canonical route `/results` — `/search` alias */
export default async function SearchAliasPage({ searchParams }: Props) {
  const { q, tab } = await searchParams;
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  if (tab?.trim()) params.set("tab", tab.trim());
  const qs = params.toString();
  redirect(qs ? `/results?${qs}` : "/results");
}
