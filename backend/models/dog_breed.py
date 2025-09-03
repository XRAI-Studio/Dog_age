from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class DogBreed(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str  # "Golden Retriever"
    lifespan: float  # 11.0
    api_breed_name: str  # "retriever-golden" for Dog CEO API
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DogBreedCreate(BaseModel):
    name: str
    lifespan: float
    api_breed_name: str

class CalculationRequest(BaseModel):
    breed_name: str
    age_years: int
    age_months: int = 0

class CalculationResponse(BaseModel):
    breed_name: str
    actual_age: str
    actual_age_decimal: float
    dog_years: str
    breed_lifespan: float
    image_url: str
    formula_used: str

class CalculationLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    breed_name: str
    age_years: int
    age_months: int
    dog_years: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)