import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import glsl from "vite-plugin-glsl";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const shaderLabPlugin = (): Plugin => ({
  name: "shader-lab-plugin",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url === "/api/save-shader" && req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", () => {
          try {
            const { filename, code } = JSON.parse(body);
            const filePath = path.resolve(__dirname, "src/shaders/parts", filename);
            fs.writeFileSync(filePath, code);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true }));
          } catch (error) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "Failed to save shader" }));
          }
        });
      } else if (req.url === "/api/create-shader" && req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", () => {
          try {
            const { filename } = JSON.parse(body);
            const filePath = path.resolve(__dirname, "src/shaders/parts", filename);
            if (!fs.existsSync(filePath)) {
              fs.writeFileSync(filePath, "// New effect\nlayer = vec4(1.0, 0.0, 0.0, 1.0); // Red placeholder");
            }
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true }));
          } catch (error) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "Failed to create shader" }));
          }
        });
      } else if (req.url === "/api/delete-shader" && req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", () => {
          try {
            const { filename } = JSON.parse(body);
            const filePath = path.resolve(__dirname, "src/shaders/parts", filename);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ success: true }));
          } catch (error) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "Failed to delete shader" }));
          }
        });
      } else {
        next();
      }
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), glsl(), shaderLabPlugin()],
});