import { z } from 'zod';

// every refusal the api sends, from a bad key to a stale cursor, is this one shape
export const apiErrorSchema = z.object({ message: z.string() });

export type ApiError = z.infer<typeof apiErrorSchema>;
