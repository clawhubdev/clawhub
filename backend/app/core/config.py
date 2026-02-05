from pydantic_settings import BaseSettings
from typing import Optional, Union

class Settings(BaseSettings):
    PROJECT_NAME: str = "ClawHub API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/v1"
    
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "clawhub"
    DATABASE_URL: Optional[str] = None
    
    SECRET_KEY: str = "TEMP_KEY"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    
    ADMIN_KEY: str = "change_me_in_production"  # Override in .env
    
    BACKEND_CORS_ORIGINS: Union[str, list] = "http://localhost:3000,https://clawhub.com,https://www.clawhub.com"
    
    @property
    def cors_origins(self) -> list:
        """Parse CORS origins from string or list"""
        if isinstance(self.BACKEND_CORS_ORIGINS, str):
            return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",")]
        return self.BACKEND_CORS_ORIGINS
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"

settings = Settings()