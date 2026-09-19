import { redirect } from "next/navigation";
import { getTrackUrl } from "@/lib/utils/domain";

interface PageProps {
  params: Promise<{ username: string; orderId: string }>;
}

export default async function SupplierTrackOrderIdRedirectPage({ params }: PageProps) {
  const { username, orderId } = await params;
  const cleanUsername = decodeURIComponent(username || "").replace(/^@/, "");
  redirect(getTrackUrl(cleanUsername, orderId));
}
