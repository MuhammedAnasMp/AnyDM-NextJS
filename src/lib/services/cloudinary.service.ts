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

export const deleteFromCloudinary = async (
  deleteToken?: string,
  options: { cloudName?: string } = {}
): Promise<boolean> => {
  if (!deleteToken) return true;
  const cloudName = options.cloudName || "dx5bqewfx";

  try {
    const formData = new FormData();
    formData.append("token", deleteToken);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/delete_by_token`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.result === "ok";
  } catch (err) {
    console.warn("Cloudinary delete failed:", err);
    return false;
  }
};
