const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const accountId = process.env.R2_ACCOUNT_ID || "6163fbb1ce599c44c408899502599dbb";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "177bf61c3a21dfb484d765d474c74ccc";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "83a94e9b4bc7591c0896a6122e11b210fb289b4cdddcb702d1e1326c08ff0789";
const bucketName = process.env.R2_BUCKET_NAME || "mtacademy";
const publicDomain = process.env.R2_PUBLIC_DOMAIN || "https://pub-bd139b4c67a1408db26fbbb5a04fdedb.r2.dev";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true,
});

const imgDir = path.join(__dirname, "..", "public", "question-images", "non-verbal");

async function uploadFile(filename) {
  const filePath = path.join(imgDir, filename);
  const fileBuffer = fs.readFileSync(filePath);
  const key = `mta-directory/question-images/non-verbal/${filename}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: "image/webp",
  });

  await client.send(command);
}

async function main() {
  const files = fs.readdirSync(imgDir).filter(f => f.endsWith(".webp"));
  console.log(`Found ${files.length} compressed WebP diagrams to upload to Cloudflare R2 bucket "${bucketName}"...`);

  let uploaded = 0;
  const concurrency = 12;

  for (let i = 0; i < files.length; i += concurrency) {
    const chunk = files.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (file) => {
        try {
          await uploadFile(file);
          uploaded++;
          if (uploaded % 50 === 0 || uploaded === files.length) {
            console.log(`Uploaded ${uploaded}/${files.length} images to Cloudflare R2...`);
          }
        } catch (err) {
          console.error(`Failed to upload ${file}:`, err.message);
        }
      })
    );
  }

  console.log(`\nAll ${uploaded} compressed images successfully synchronized to Cloudflare R2!`);
}

main().catch(err => {
  console.error("Upload script failed:", err);
  process.exit(1);
});
