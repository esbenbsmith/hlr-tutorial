import type { NextConfig } from "next";
import { BASE_PATH } from "./src/lib/basePath";

const nextConfig: NextConfig = {
  output: "export",
  basePath: BASE_PATH,
};

export default nextConfig;
