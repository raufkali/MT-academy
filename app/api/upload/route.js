import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

function getS3Client() {
  const accountId =
    process.env.R2_ACCOUNT_ID ||
    process.env.CLOUDFLARE_ACCOUNT_ID ||
    "6163fbb1ce599c44c408899502599dbb";
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    return null;
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const s3Client = getS3Client();
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME || "mtacademy";
    const directory = process.env.R2_DIRECTORY || "mta-directory";
    const publicDomain = process.env.R2_PUBLIC_DOMAIN;

    if (!s3Client || !accessKeyId || !secretAccessKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cloudflare R2 credentials (R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY) are missing in .env.local.",
        },
        { status: 500 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${directory}/${Date.now()}_${cleanName}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: file.type || "image/png",
      })
    );

    // Construct public image URL
    let downloadUrl = "";
    if (publicDomain) {
      const base = publicDomain.endsWith("/")
        ? publicDomain.slice(0, -1)
        : publicDomain;
      downloadUrl = `${base}/${key}`;
    } else {
      downloadUrl = `https://${bucketName}.r2.dev/${key}`;
    }

    return NextResponse.json({
      success: true,
      url: downloadUrl,
      key,
      bucket: bucketName,
    });
  } catch (error) {
    console.error("Cloudflare R2 upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to upload file to Cloudflare R2",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const isConfigured = Boolean(
    process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY
  );

  return NextResponse.json({
    status: "ok",
    storage: "Cloudflare R2",
    bucket: process.env.R2_BUCKET_NAME || "mtacademy",
    directory: process.env.R2_DIRECTORY || "mta-directory",
    configured: isConfigured,
  });
}
