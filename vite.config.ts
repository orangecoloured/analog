import { defineConfig } from "vite";
import netlify from "@netlify/vite-plugin";
import { PORT_DEV } from "./src/utils";

const baseConfig = {
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  }
}

const platformSpecificSettings = () => {
  switch (true) {
    case (!!process.env.NETLIFY): {
      return {
        plugins: [netlify()],
      }
    }

    case (!!process.env.VERCEL): {
      return null;
    }

    default: return null;
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
    return {
      ...baseConfig,
      ...(platformSpecificSettings()),
    };
  }
})