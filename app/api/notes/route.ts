import { NextResponse } from "next/server";
import { z } from "zod";
import { getAllNotes, saveNote } from "@/lib/services/note-service";
import { UnauthorizedError } from "@/lib/services/current-user";

const saveSchema = z.object({
  problemSlug: z.string().min(1).max(200),
  content: z.string().max(10000),
});

export async function GET() {
  try {
    const notes = await getAllNotes();
    return NextResponse.json({ data: notes, error: null });
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
    const parsed = saveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { code: "VALIDATION", message: parsed.error.message } },
        { status: 400 }
      );
    }
    const result = await saveNote(parsed.data.problemSlug, parsed.data.content);
    return NextResponse.json({ data: result, error: null });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ data: null, error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ data: null, error: { code: "INTERNAL", message: "Something went wrong" } }, { status: 500 });
  }
}
