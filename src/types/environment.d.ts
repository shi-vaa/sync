declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      MONGO_URI: string;
      TOKEN_SECRET: string;
      ROLES_KEY: string;
      POLYGON_RPC: string;
      DEFAULT_BEARER_TOKEN: string;
    }
  }
}

export {};
