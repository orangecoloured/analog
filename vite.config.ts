import { defineConfig, type UserConfig } from "vite";
import netlify from "@netlify/vite-plugin";
import { PORT_DEV } from "./src/utils";
import path from 'path'

const vercelBuildApiFiles = [
  'src/api/get.ts',
  //'src/api/push.ts',
  //'src/api/cleanUp.ts',
]

const baseConfig = {
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    
    rollupOptions: {
      input: vercelBuildApiFiles.reduce((entries, file) => {
        const relativePath = path.relative('src', file)
        const entryName = relativePath.replace(/\.ts$/, '')
        
        entries[entryName] = path.resolve(__dirname, file)
        
        return entries;
      }, {} as Record<string, string>),
      output: {
        entryFileNames: '[name].js',
        //preserveModulesRoot: 'src',
      },
    },
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
      return config;
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