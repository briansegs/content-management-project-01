import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/write-client";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    // Update views in Sanity
    await writeClient
      .patch(id)
      .setIfMissing({ views: 0 }) // Ensure 'views' exists
      .inc({ views: 1 }) // Increment 'views' by 1
      .commit();

    return NextResponse.json({ message: "Views updated successfully!" });
  } catch (error) {
    console.error("Error updating views:", error);
    return NextResponse.json(
      { error: "Failed to update views" },
      { status: 500 }
    );
  }
}
