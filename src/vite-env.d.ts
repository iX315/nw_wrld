/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PACKAGE_VERSION: string;
  readonly REPO_URL: string;
}
  
interface ImportMeta {
  readonly env: ImportMetaEnv
}