import { NextResponse } from "next/server";
import { z } from "zod";
import { getAllProgress, setProgressStatus } from "@/lib/services/progress-service";
import { UnauthorizedError } from "@/lib/services/current-user";

const updateSchema = z.object({
  problemSlug: z.string().min(1).max(200),
  status: z.enum(["ATTEMPTED", "SOLVED", "REVISIT"]).nullable(),
});

export async function GET() {
  try {
    const progress = await getAllProgress();
    return NextResponse.json({ data: progress, error: null });
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
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { code: "VALIDATION", message: parsed.error.message } },
        { status: 400 }
      );
    }
    const result = await setProgressStatus(parsed.data.problemSlug, parsed.data.status);
    return NextResponse.json({ data: result, error: null });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ data: null, error: { code: "UNAUTHORIZED", message: "Sign in required" } }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ data: null, error: { code: "INTERNAL", message: "Something went wrong" } }, { status: 500 });
  }
}
