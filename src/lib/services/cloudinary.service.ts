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
  file: File | Blob,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  const cloudName = options.cloudName || "dx5bqewfx";
  const uploadPreset = options.uploadPreset || "any_dm_product_upload";

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

  let cloudName = options.cloudName || "dx5bqewfx";
  let token: string | undefined;
  let publicId: string | undefined;
  let resourceType = "image";

  if (typeof identifier === "string") {
    if (identifier.includes("cloudinary.com")) {
      const extracted = extractPublicIdFromCloudinaryUrl(identifier);
      publicId = extracted.publicId;
      if (extracted.resourceType) resourceType = extracted.resourceType;
    } else {
      token = identifier;
    }
  } else if (typeof identifier === "object") {
    if (identifier.cloudName) cloudName = identifier.cloudName;
    token = identifier.deleteToken;
    publicId = identifier.publicId;
    if (identifier.resourceType) resourceType = identifier.resourceType;

    if (!publicId && !token && identifier.url) {
      const extracted = extractPublicIdFromCloudinaryUrl(identifier.url);
      publicId = extracted.publicId;
      if (extracted.resourceType) resourceType = extracted.resourceType;
    }
  }

  if (!token && !publicId) return true;

  try {
    const formData = new FormData();
    if (token) {
      formData.append("token", token);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/delete_by_token`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.result === "ok";
    } else if (publicId) {
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
    }
    return true;
  } catch (err) {
    console.warn("Cloudinary delete failed:", err);
    return false;
  }
};

