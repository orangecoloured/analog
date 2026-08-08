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
    const portServer = Number(process.env.ANALOG_PORT_SERVER as string);

    return {
      ...baseConfig,
      server: {
        port: PORT_DEV,
        proxy: {
          "/api": `http://localhost:${isNaN(portServer) ? PORT_DEV + 1 : portServer}`,
        },
      },
    };
  } else {
    return platformSpecificConfig(baseConfig);
  }
});
