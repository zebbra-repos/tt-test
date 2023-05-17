declare module 'nuxt/schema' {
  interface AppConfig {
    backendUrl: string
  }
  interface RuntimeConfig {
    public: {
      backendUrl: string
    }
  }
}

// It is always important to ensure you import/export something when augmenting a type
export {}
