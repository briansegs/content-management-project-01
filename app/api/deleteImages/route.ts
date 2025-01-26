import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, // Set in .env.local
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY, // Set in .env.local
  api_secret: process.env.CLOUDINARY_API_SECRET, // Set in .env.local
});

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { public_ids } = body;

  console.log("public_ids: ", public_ids);

  if (!public_ids || !Array.isArray(public_ids)) {
    return NextResponse.json(
      { error: "Public IDs are required and must be an array" },
      { status: 400 }
    );
  }

  try {
    // Loop through each public_id and destroy it
    const results = await Promise.all(
      public_ids.map(async (id) => {
        return cloudinary.uploader.destroy(id);
      })
    );

    return NextResponse.json({ message: "Images deleted", results });
  } catch (error) {
    console.error("Error deleting images:", error);
    return NextResponse.json(
      { error: "Failed to delete images" },
      { status: 500 }
    );
  }
}
