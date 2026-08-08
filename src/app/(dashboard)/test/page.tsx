import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { HealthCheck } from "./health-check";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export default function TestPage() {
  prefetch(trpc.health.queryOptions());
  return (
    <HydrateClient>
      <div className="flex flex-col items-center justify-center gap-8 p-8">
        <h1 className="text-2xl font-semibold">Trpc test page</h1>
        <ErrorBoundary fallback={<div>something went error</div>}>
          <Suspense fallback={<div>Loading...</div>}>
            <HealthCheck />
          </Suspense>
        </ErrorBoundary>
      </div>
    </HydrateClient>
  );
}
