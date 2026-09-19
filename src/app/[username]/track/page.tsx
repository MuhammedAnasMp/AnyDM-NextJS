import { redirect } from "next/navigation";
import { getOrdersUrl } from "@/lib/utils/domain";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function SupplierTrackRedirectPage({ params }: PageProps) {
  const { username } = await params;
  const cleanUsername = decodeURIComponent(username || "").replace(/^@/, "");
  redirect(getOrdersUrl(cleanUsername));
}
