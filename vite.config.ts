import { defineConfig, type UserConfig } from "vite";
import netlify from "@netlify/vite-plugin";
import { PORT_DEV } from "./src/utils";
import path from "path";
import fs from "fs";

function getAllTSFiles(dir: string, baseDir: string): Record<string, string> {
  const entries: Record<string, string> = {}

  function walk(currentDir: string) {
    const items = fs.readdirSync(currentDir)
    for (const item of items) {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        walk(fullPath)
      } else if (stat.isFile() && fullPath.endsWith('.ts')) {
        // Remove base path and .ts extension to create key
        const relativePath = path.relative(baseDir, fullPath)
        const key = relativePath.replace(/\.ts$/, '') // e.g., "utils/helper"
        entries[key] = fullPath
      }
    }
  }

  walk(dir)
  return entries
}

const baseConfig = {
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  }
}

const platformSpecificConfig = (config: UserConfig) => {
  switch (true) {
    case (!!process.env.NETLIFY): {
      return {
        ...config,
        plugins: [netlify()],
      }
    }

    case (!!process.env.VERCEL): {
      return {
        ...config,
        build: {
          ...config.build,
          rollupOptions: {
            input: {
              main: path.resolve(__dirname, 'index.html'),
              ...getAllTSFiles(
                path.resolve(__dirname, 'src/api'),
                path.resolve(__dirname, 'src')
              )
            },
            output: {
              entryFileNames: assetInfo => {
                if (assetInfo.name && assetInfo.name.startsWith('api/')) {
                  return `${assetInfo.name}.js`
                }
                return `[name].js`
              }
            }
          }
        }
      }
    }

    default:
      return config;
  }
}

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    let port = parseInt(process.env.VITE_ANALOG_PORT_DEV as string, 10);

    port = isNaN(port) ? PORT_DEV : port;

    return {
      ...baseConfig,
      server: {
        port,
        proxy: {
          "/api/get": `http://localhost:${port + 1}`,
          "/api/post": `http://localhost:${port + 1}`,
        }
      }
    };
  } else {
    return platformSpecificConfig(baseConfig);
  }
})