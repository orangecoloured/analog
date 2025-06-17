import { defineConfig, type UserConfig } from "vite";
import netlify from "@netlify/vite-plugin";
import { PORT_DEV } from "./src/utils";

const baseConfig = {
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
};

const platformSpecificConfig = (config: UserConfig) => {
  switch (true) {
    case !!process.env.NETLIFY: {
      return {
        ...config,
        plugins: [netlify()],
      };
    }

    case !!process.env.VERCEL: {
      return config;
    }

    default:
      return config;
  }
};

export default defineConfig(({ command }) => {
  if (command === "serve") {
    const port = Number(process.env.ANALOG_PORT_SERVER as string);

    return {
      ...baseConfig,
      server: {
        port,
        proxy: {
          "/api": `http://localhost:${isNaN(port) ? PORT_DEV + 1 : port}`,
        },
      },
    };
  } else {
    return platformSpecificConfig(baseConfig);
  }
});
