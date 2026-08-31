import { put } from "@vercel/blob";

export async function uploadImageToBlob(
  data: File | Buffer | ArrayBuffer,
  contentType: string,
  ext: string,
): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not configured");

  const pathname = `portfolio/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const blob = await put(pathname, data, {
    access: "public",
    contentType,
    token,
  });

  return blob.url;
}
