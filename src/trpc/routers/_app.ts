import { createTRPCRouter } from '../init';
import { voicesRouter } from '@/trpc/routers/voices';
export const appRouter = createTRPCRouter({
  voices: voicesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;