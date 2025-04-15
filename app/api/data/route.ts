
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

const BLOB_NAME = "weight-tracker.json";

export async function GET() {
  try {
    const res = await fetch(`https://blob.vercel-storage.com/${BLOB_NAME}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  const data = await req.json();
  await put(BLOB_NAME, JSON.stringify(data), {
    contentType: "application/json",
    access: "public"
  });
  return NextResponse.json({ success: true });
}

