// node binds a module's sourcemap as it compiles it, so the switch is thrown here and the import below stays dynamic to land after it
process.setSourceMapsEnabled(true);

export const fetch = async (request) => (await import('./server.js')).fetch(request);
