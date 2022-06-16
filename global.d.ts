declare namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      HOST: string;
      PEMPASSPHRASE: string;
      JWT_KEY: string;
    }
  }