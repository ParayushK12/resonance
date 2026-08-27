import { createTRPCRouter } from '../init';
import { voicesRouter } from '@/trpc/routers/voices';
import { generationsRouter } from '@/trpc/routers/generations';

export const appRouter = createTRPCRouter({
  voices: voicesRouter,
  generations: generationsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;