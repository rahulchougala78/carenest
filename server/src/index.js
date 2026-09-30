import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, '../.env') });

const { createApp } = await import('./app.js');
const port = Number(process.env.PORT || 8080);
const app = createApp();

app.listen(port, () => {
  console.log(`CareNest API listening on port ${port}`);
});
