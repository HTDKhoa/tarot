import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Cảnh three.js: thay đổi camera, buffer, material trong useFrame là cách dùng chuẩn của R3F,
    // không phải state React, nên tắt hai rule của React Compiler cho thư mục này.
    files: ["src/components/scene/**"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
    },
  },
  {
    // Ảnh pixel nhỏ, tự tối ưu; next/image không cần thiết
    rules: { "@next/next/no-img-element": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".open-next/**",
    ".wrangler/**",
    // Skill của agent (impeccable…), không phải code của dự án
    ".claude/**",
    ".agents/**",
    ".agent/**",
    ".gemini/**",
    ".codex/**",
    // Bản demo một file đã build
    "demo/dist/**",
  ]),
]);

export default eslintConfig;
