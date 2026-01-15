import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { spawn } from 'child_process';
import path from 'path';

// Custom Plugin for Wujia Scraper Node Worker
const wujiaScraperPlugin = (): Plugin => {
  return {
    name: 'wujia-scraper',
    configureServer(server) {
      server.middlewares.use('/api/scrape-wujia', async (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });

          req.on('end', () => {
            // Parse body
            let orderNumber = '';
            try {
              const json = JSON.parse(body);
              orderNumber = json.orderNumber;
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON body' }));
              return;
            }

            if (!orderNumber) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing orderNumber' }));
              return;
            }

            console.log(`[Vite Plugin] Spawning scraper for ${orderNumber}...`);

            // Spawn Node Worker
            // Use absolute path to be safe
            const workerPath = path.resolve(__dirname, 'src/workers/wujia-scraper.worker.cjs');
            const worker = spawn('node', [workerPath, orderNumber], { stdio: 'pipe' });

            let outputData = '';
            let errorData = '';

            worker.stdout.on('data', (chunk) => {
              outputData += chunk.toString();
            });

            worker.stderr.on('data', (chunk) => {
              const str = chunk.toString();
              console.error(`[Worker Error]: ${str}`);
              errorData += str;
            });

            worker.on('close', (code) => {
              if (code === 0) {
                // Success - try to parse JSON from stdout to ensure it's valid
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                // Clean up output: find the last valid JSON
                res.end(outputData);
              } else {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: errorData || 'Scraper worker failed' }));
              }
            });
          });
        } else {
          next();
        }
      });
    }
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), wujiaScraperPlugin()],
})
