import { notFound } from "next/navigation";
import { BRAND_CONVERSATIONS } from "@/lib/mock-data/brand-responses";
import { BrandResponseDetailPanel } from "@/components/brand-responses/BrandResponseDetailPanel";

export function generateStaticParams() {
  return BRAND_CONVERSATIONS.map((c) => ({ id: c.id }));
}

export default async function BrandResponseDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conv = BRAND_CONVERSATIONS.find((c) => c.id === id);
  if (!conv) return notFound();

  return <BrandResponseDetailPanel id={id} variant="page" />;
}
