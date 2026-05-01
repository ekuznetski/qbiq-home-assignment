/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_FAKE_LATENCY_MS?: string;
  readonly VITE_MOCK_FAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
