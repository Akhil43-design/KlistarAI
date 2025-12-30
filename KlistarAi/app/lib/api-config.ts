export const API_CONFIG = {
    // User provided Groq Key
    GROQ_API_KEY: process.env.GROQ_API_KEY || "",

    // Google Search Configuration (Removed as per request)
    GOOGLE_SEARCH_API_KEY: "",
    GOOGLE_CX: "",

    // Provider configuration
    PROVIDERS: {
        GROQ: 'groq',
        OPENAI: 'openai',
    }
};
