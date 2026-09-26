import { app } from './app';

// a named fetch export, because Vercel's Node runtime reads a default export as (req, res) and discards what it returns
export const fetch = (request: Request): Response | Promise<Response> => app.fetch(request);
