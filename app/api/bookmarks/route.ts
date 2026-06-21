import { NextResponse } from "next/server";
import { z } from "zod";
import { getAllBookmarks, toggleBookmark } from "@/lib/services/bookmark-service";
import { UnauthorizedError } from "@/lib/services/current-user";

const toggleSchema = z.object({
  problemSlug: z.string().min(1).max(200),
});

export async function GET() {
  try {
    const bookmarks = await getAllBookmarks();
    return NextResponse.json({ data: bookmarks, error: null });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ data: null, error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ data: null, error: { code: "INTERNAL", message: "Something went wrong" } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = toggleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { code: "VALIDATION", message: parsed.error.message } },
        { status: 400 }
      );
    }
    const isBookmarked = await toggleBookmark(parsed.data.problemSlug);
    return NextResponse.json({ data: { isBookmarked }, error: null });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ data: null, error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ data: null, error: { code: "INTERNAL", message: "Something went wrong" } }, { status: 500 });
  }
}
