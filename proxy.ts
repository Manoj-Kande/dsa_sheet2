import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that require sign-in. Everything else (problems list, topics,
// companies, sheets — all static content) stays public so people can
// browse before creating an account.
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/bookmarks(.*)",
  "/api/progress(.*)",
  "/api/bookmarks(.*)",
  "/api/notes(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
