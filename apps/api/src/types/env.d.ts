namespace NodeJS {
  /**
   * Use `env` from `api/env.ts` instead. That way proper `.env` files are loaded and types are correct.
   */
  export interface ProcessEnv {
    /**
     * @deprecated Use `env` from `api/env.ts` instead. That way proper `.env` files are loaded and types are correct.
     */
    [key: string]: string | undefined;
  }
}
