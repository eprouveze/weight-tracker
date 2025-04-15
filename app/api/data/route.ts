import { NextResponse } from "next/server";
import { put, list, del } from "@vercel/blob";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const BLOB_NAME = "weight-tracker.json";
const USE_LOCAL_STORAGE = process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === "true";
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const LOCAL_DATA_PATH = join(process.cwd(), "local-data");
const LOCAL_FILE_PATH = join(LOCAL_DATA_PATH, BLOB_NAME);

// Ensure local data directory exists if using local storage
if (USE_LOCAL_STORAGE && !existsSync(LOCAL_DATA_PATH)) {
  try {
    mkdirSync(LOCAL_DATA_PATH, { recursive: true });
  } catch (error) {
    console.error("Failed to create local data directory:", error);
  }
}

export async function GET() {
  try {
    if (USE_LOCAL_STORAGE) {
      // Use local file storage
      try {
        if (existsSync(LOCAL_FILE_PATH)) {
          const data = readFileSync(LOCAL_FILE_PATH, "utf-8");
          return NextResponse.json(JSON.parse(data));
        } else {
          // Initialize with empty array if file doesn't exist
          writeFileSync(LOCAL_FILE_PATH, JSON.stringify([]), "utf-8");
          return NextResponse.json([]);
        }
      } catch (error) {
        console.error("Error accessing local storage:", error);
        return NextResponse.json([]);
      }
    } else {
      // Use Vercel Blob in all environments when configured
      try {
        console.log("Fetching from Vercel Blob...");
        // Try using proper Vercel blob API with token first
        if (BLOB_TOKEN) {
          try {
            // Check if blob exists by listing blobs
            const blobs = await list({
              token: BLOB_TOKEN,
              prefix: BLOB_NAME,
            });
            
            const blobExists = blobs.blobs.some(blob => blob.pathname === BLOB_NAME);
            
            if (blobExists) {
              // Blob exists, fetch it using the public URL
              const blobUrl = blobs.blobs.find(blob => blob.pathname === BLOB_NAME)?.url;
              if (!blobUrl) {
                throw new Error("Blob exists but URL is missing");
              }
              const res = await fetch(blobUrl);
              if (!res.ok) {
                throw new Error(`Failed to fetch blob: ${res.status} ${res.statusText}`);
              }
              const text = await res.text();
              try {
                const data = JSON.parse(text);
                console.log("Vercel Blob data fetched successfully");
                return NextResponse.json(data);
              } catch (parseError) {
                console.error("Error parsing JSON from blob:", parseError);
                return NextResponse.json([]);
              }
            } else {
              console.log("Blob not found, initializing with empty array");
              // Create initial blob with empty array
              await put(BLOB_NAME, JSON.stringify([]), {
                contentType: "application/json",
                access: "public",
                token: BLOB_TOKEN,
              });
              return NextResponse.json([]);
            }
          } catch (blobError) {
            console.error("Error using Vercel Blob API:", blobError);
            // Fall back to public URL
          }
        }
        
        // Fallback: try public URL if token approach fails
        try {
          console.log("Trying fallback approach...");
          const STORE_ID = process.env.VERCEL_BLOB_STORE_ID;
          if (!STORE_ID) {
            throw new Error("Missing VERCEL_BLOB_STORE_ID environment variable");
          }
          const publicUrl = `https://${STORE_ID}.public.blob.vercel-storage.com/${BLOB_NAME}`;
          console.log("Using public URL:", publicUrl);
          const res = await fetch(publicUrl);
          if (!res.ok) {
            throw new Error(`Failed to fetch blob from public URL: ${res.status} ${res.statusText}`);
          }
          const data = await res.json();
          return NextResponse.json(data);
        } catch (fallbackError) {
          console.error("Error in fallback approach:", fallbackError);
          return NextResponse.json([]);
        }
      } catch (error) {
        console.error("Error fetching from Vercel Blob:", error);
        return NextResponse.json([]);
      }
    }
  } catch (error) {
    console.error("Unexpected error in GET handler:", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    if (!Array.isArray(data)) {
      return NextResponse.json({ error: "Expected array data" }, { status: 400 });
    }
    
    if (USE_LOCAL_STORAGE) {
      // Save to local file
      try {
        writeFileSync(LOCAL_FILE_PATH, JSON.stringify(data), "utf-8");
        return NextResponse.json({ success: true });
      } catch (error) {
        console.error("Error writing to local storage:", error);
        return NextResponse.json({ error: "Failed to save data locally" }, { status: 500 });
      }
    } else {
      // Use Vercel Blob in all environments
      try {
        console.log("Saving to Vercel Blob...");
        if (BLOB_TOKEN) {
          await put(BLOB_NAME, JSON.stringify(data), {
            contentType: "application/json",
            access: "public",
            token: BLOB_TOKEN,
            allowOverwrite: true
          });
          console.log("Data saved to Vercel Blob successfully");
          return NextResponse.json({ success: true });
        } else {
          console.error("Missing BLOB_READ_WRITE_TOKEN environment variable");
          return NextResponse.json(
            { error: "Blob storage not configured properly" }, 
            { status: 500 }
          );
        }
      } catch (error) {
        console.error("Error saving to Vercel Blob:", error);
        return NextResponse.json({ error: "Failed to save data to Blob storage" }, { status: 500 });
      }
    }
  } catch (error) {
    console.error("Unexpected error in POST handler:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

