import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: "./src/entry.tsx",
    },
    define: {
      GEMINI_API_KEY__: JSON.stringify(process.env.GEMINI_API_KEY),
    },
  },
  tools: {
    postcss: {
      postcssOptions: {
        plugins: [require("tailwindcss"), require("autoprefixer")],
      },
    },
  },
});
