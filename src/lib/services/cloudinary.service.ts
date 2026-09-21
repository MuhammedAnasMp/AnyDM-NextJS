export interface CloudinaryUploadOptions {
  uploadPreset?: string;
  cloudName?: string;
  onProgress?: (percent: number) => void;
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  delete_token?: string;
  [key: string]: any;
}

export const uploadToCloudinary = (
  file: File | Blob | string,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  const cloudName = options.cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const uploadPreset = options.uploadPreset || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && options.onProgress) {
        options.onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve(res);
        } catch (err) {
          reject(new Error("Failed to parse Cloudinary response"));
        }
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          reject(new Error(errRes?.error?.message || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during Cloudinary upload"));
    };

    xhr.send(formData);
  });
};

export interface CloudinaryDeleteOptions {
  cloudName?: string;
  publicId?: string;
  deleteToken?: string;
  resourceType?: string;
  url?: string;
}

export function extractPublicIdFromCloudinaryUrl(url: string): { publicId?: string; resourceType?: string } {
  if (!url || typeof url !== "string") return {};
  if (!url.includes("cloudinary.com")) return {};

  try {
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return {};

    const resourceType = parts[uploadIndex - 1] || "image";
    let remainingParts = parts.slice(uploadIndex + 1);

    if (remainingParts.length > 0 && /^v\d+$/.test(remainingParts[0])) {
      remainingParts = remainingParts.slice(1);
    }

    if (remainingParts.length === 0) return { resourceType };

    const fullPathWithExt = remainingParts.join("/");
    const lastDotIndex = fullPathWithExt.lastIndexOf(".");
    const publicId = lastDotIndex !== -1 ? fullPathWithExt.substring(0, lastDotIndex) : fullPathWithExt;

    return { publicId, resourceType };
  } catch (err) {
    console.warn("Failed to extract publicId from Cloudinary URL:", err);
    return {};
  }
}

export const deleteFromCloudinary = async (
  identifier?: string | CloudinaryDeleteOptions,
  options: { cloudName?: string } = {}
): Promise<boolean> => {
  if (!identifier) return true;

  let publicId: string | undefined;
  let resourceType = "image";
  let deleteToken: string | undefined;

  if (typeof identifier === "string") {
    if (identifier.includes("cloudinary.com") || identifier.startsWith("http://") || identifier.startsWith("https://")) {
      const extracted = extractPublicIdFromCloudinaryUrl(identifier);
      publicId = extracted.publicId;
      if (extracted.resourceType) resourceType = extracted.resourceType;
    } else {
      // If a raw string is passed, treat it as public_id
      publicId = identifier;
    }
  } else if (typeof identifier === "object") {
    deleteToken = identifier.deleteToken;
    publicId = identifier.publicId;
    if (identifier.resourceType) resourceType = identifier.resourceType;

    if (!publicId && identifier.url) {
      const extracted = extractPublicIdFromCloudinaryUrl(identifier.url);
      publicId = extracted.publicId;
      if (extracted.resourceType) resourceType = extracted.resourceType;
    }
  }

  // Explicit deleteToken branch (only if deleteToken is explicitly passed)
  if (deleteToken && !publicId) {
    try {
      const cloudName = options.cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
      const formData = new FormData();
      formData.append("token", deleteToken);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/delete_by_token`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.result === "ok";
    } catch (err) {
      console.warn("Cloudinary delete_by_token failed:", err);
      return false;
    }
  }

  if (!publicId) return true;

  // Primary route: Next.js backend API route /api/cloudinary/delete
  try {
    const res = await fetch("/api/cloudinary/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        public_id: publicId,
        resource_type: resourceType,
      }),
    });
    const data = await res.json();
    return data.success || data.result === "ok";
  } catch (err) {
    console.warn("Cloudinary delete via Next.js API failed:", err);
    return false;
  }
};

