"use client";

import React, { use } from "react";
import LinkInBioPublicView from "@/components/bio/LinkInBioPublicView";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function DirectBioPage({ params }: PageProps) {
  const { username } = use(params);
  const cleanUsername = decodeURIComponent(username || "").replace(/^@/, "");

  return <LinkInBioPublicView username={cleanUsername} />;
}
