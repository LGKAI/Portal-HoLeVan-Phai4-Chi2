from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    LLM_PROVIDER: str = "ollama"  # "ollama" hoặc "gemini"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    OLLAMA_BASE_URL: str = "http://host.docker.internal:11434"
    OLLAMA_LLM_MODEL: str = "qwen2.5:7b"
    OLLAMA_EMBED_MODEL: str = "nomic-embed-text"
    CHROMA_PERSIST_DIR: str = "./data/vector_store"
    RAW_DOCS_DIR: str = "./data/raw_documents"
    BACKEND_URL: str = "http://backend:5000"
    PORT: int = 8000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()

