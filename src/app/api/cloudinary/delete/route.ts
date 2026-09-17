import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { public_id, resource_type = "image" } = body;

    if (!public_id) {
      return NextResponse.json({ error: "public_id is required" }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
    const apiKey = process.env.CLOUDINARY_API_KEY || "";
    const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

    const timestamp = Math.floor(Date.now() / 1000);
    // Cloudinary signature parameters must be sorted alphabetically
    const signatureStr = `public_id=${public_id}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signatureStr).digest("hex");

    const formData = new FormData();
    formData.append("public_id", public_id);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resource_type}/destroy`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return NextResponse.json({
      success: data.result === "ok",
      result: data.result,
      details: data,
    });
  } catch (error: any) {
    console.error("[Cloudinary Delete Route] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete Cloudinary media" },
      { status: 500 }
    );
  }
}
