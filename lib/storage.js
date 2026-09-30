import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Upload an image file to Cloudflare R2 storage via Next.js backend API
 * @param {File} file
 * @returns {Promise<string>} Cloudflare R2 public URL
 */
export async function uploadToCloudflareR2(file) {
  if (!file) throw new Error("No file provided");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to upload image to Cloudflare R2");
  }

  return data.url;
}

/**
 * Primary uploader for question diagrams (Non-Verbal & Visual MCQs)
 * @param {File} file
 * @param {string} folder Optional folder for fallback
 * @returns {Promise<string>} Public download URL
 */
export async function uploadQuestionImage(file, folder = "question-images") {
  try {
    return await uploadToCloudflareR2(file);
  } catch (err) {
    console.error("Cloudflare R2 upload error:", err.message);

    // If R2 is not fully configured yet, fallback gracefully to Firebase Storage
    if (storage) {
      console.warn("Attempting fallback to Firebase Storage...");
      try {
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileName = `${Date.now()}_${cleanName}`;
        const storageRef = ref(storage, `${folder}/${fileName}`);
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      } catch (fbErr) {
        console.error("Firebase fallback failed:", fbErr);
      }
    }

    throw err;
  }
}
