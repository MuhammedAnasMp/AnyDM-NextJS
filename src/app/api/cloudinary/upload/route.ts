import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "anydm_digital_products";
    let resourceType = (formData.get("resource_type") as string) || "auto";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dx5bqewfx";
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "";
    const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || "";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

    // Determine resource type if auto:
    if (resourceType === "auto") {
      const mime = file.type.toLowerCase();
      if (mime.startsWith("image/")) {
        resourceType = "image";
      } else if (mime.startsWith("video/")) {
        resourceType = "video";
      } else {
        resourceType = "raw"; // for PDF, ZIP, EPUB, etc.
      }
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("folder", folder);

    if (apiSecret && apiKey) {
      // Signed upload
      const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");
      cloudinaryFormData.append("api_key", apiKey);
      cloudinaryFormData.append("timestamp", String(timestamp));
      cloudinaryFormData.append("signature", signature);
    } else if (uploadPreset) {
      // Unsigned upload
      cloudinaryFormData.append("upload_preset", uploadPreset);
    }

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    );

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Cloudinary upload failed" },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      url: data.secure_url || data.url,
      public_id: data.public_id,
      resource_type: data.resource_type || resourceType,
      bytes: data.bytes,
      format: data.format || file.name.split(".").pop(),
      original_filename: data.original_filename || file.name,
    });
  } catch (error: any) {
    console.error("[Cloudinary Upload Route Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file to Cloudinary" },
      { status: 500 }
    );
  }
}
