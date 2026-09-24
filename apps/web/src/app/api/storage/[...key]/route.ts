import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { createLogger } from "@rallly/logger";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { assetProfiles } from "@/app/api/storage/asset-profiles";
import { env } from "@/env";
import { isSelfHosted } from "@/lib/constants";
import { parseAssetKey } from "@/lib/storage/asset-profile";
import { verifyUploadToken } from "@/lib/storage/asset-upload";
import { getS3Client } from "@/lib/storage/s3";

const logger = createLogger("api/storage");

const MIME_MAP: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  webp: "image/webp",
  gif: "image/gif",
};

async function getAvatar(key: string) {
  const s3Client = getS3Client();

  if (s3Client) {
    const command = new GetObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error("Object not found");
    }

    const arrayBuffer = await response.Body.transformToByteArray();
    const buffer = Buffer.from(arrayBuffer);

    return {
      buffer,
      contentType: response.ContentType || "application/octet-stream",
    };
  }

  // Fallback to local filesystem storage
  const fsp = await import("node:fs/promises");
  const pathModule = await import("node:path");
  const filePath = pathModule.join(process.cwd(), "public/uploads", key);
  const buffer = await fsp.readFile(filePath);
  const ext = pathModule.extname(key).replace(/^\./, "").toLowerCase();

  return {
    buffer,
    contentType: MIME_MAP[ext] || "application/octet-stream",
  };
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ key: string[] }> },
) {
  const imageKey = (await context.params).key.join("/");

  if (!imageKey) {
    return new NextResponse("No key provided", { status: 400 });
  }

  try {
    const { buffer, contentType } = await getAvatar(imageKey);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
        "Content-Security-Policy": "sandbox; frame-ancestors 'none'",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    logger.error({ error, imageKey }, "Failed to fetch object from storage");
    return NextResponse.json(
      { error: "Failed to fetch object" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ key: string[] }> },
) {
  if (!isSelfHosted) {
    return new NextResponse("Not found", { status: 404 });
  }

  const keyParts = (await context.params).key;

  if (keyParts[0] !== "upload" || keyParts.length < 2) {
    return new NextResponse("Not found", { status: 404 });
  }

  const key = keyParts.slice(1).join("/");
  const token = req.nextUrl.searchParams.get("token");

  if (!token || !verifyUploadToken(key, token)) {
    return new NextResponse("Invalid token", { status: 401 });
  }

  const parsedKey = parseAssetKey(key, assetProfiles);

  if (!parsedKey) {
    return new NextResponse("Not found", { status: 404 });
  }

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType !== parsedKey.mimeType) {
    return new NextResponse("Unsupported content type", { status: 415 });
  }

  const maxUploadBytes = parsedKey.profile.maxSize;
  const contentLength = Number(req.headers.get("content-length"));

  if (
    !Number.isFinite(contentLength) ||
    contentLength <= 0 ||
    contentLength > maxUploadBytes
  ) {
    return new NextResponse("Invalid content length", { status: 413 });
  }

  const arrayBuffer = await req.arrayBuffer();

  if (arrayBuffer.byteLength > maxUploadBytes) {
    return new NextResponse("Payload too large", { status: 413 });
  }

  if (arrayBuffer.byteLength !== contentLength) {
    return new NextResponse("Content length mismatch", { status: 400 });
  }

  const s3Client = getS3Client();

  if (s3Client) {
    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: env.S3_BUCKET_NAME,
          Key: key,
          ContentType: contentType,
          ContentLength: arrayBuffer.byteLength,
          Body: new Uint8Array(arrayBuffer),
        }),
      );
    } catch (error) {
      logger.error({ error, key }, "Failed to upload object to storage");
      return NextResponse.json(
        { error: "Failed to upload object" },
        { status: 500 },
      );
    }
  } else {
    // Local filesystem storage fallback
    try {
      const fsp = await import("node:fs/promises");
      const pathModule = await import("node:path");
      const filePath = pathModule.join(process.cwd(), "public/uploads", key);
      await fsp.mkdir(pathModule.dirname(filePath), { recursive: true });
      await fsp.writeFile(filePath, Buffer.from(arrayBuffer));
    } catch (error) {
      logger.error({ error, key }, "Failed to save object to local storage");
      return NextResponse.json(
        { error: "Failed to upload object" },
        { status: 500 },
      );
    }
  }

  return new NextResponse(null, { status: 200 });
}
