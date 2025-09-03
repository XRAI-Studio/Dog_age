from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
import logging
import os
from datetime import datetime

from models.dog_breed import DogBreed, DogBreedCreate, CalculationRequest, CalculationResponse, CalculationLog
from services.dog_ceo_service import DogCEOService
from services.age_calculator_service import AgeCalculatorService

logger = logging.getLogger(__name__)

# Get database connection
from motor.motor_asyncio import AsyncIOMotorClient
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

router = APIRouter(prefix="/api", tags=["dog"])

# Dog breeds data with their lifespans
DOG_BREEDS_DATA = [
    {"name": "Affenpinscher", "lifespan": 13.5, "api_breed_name": "affenpinscher"},
    {"name": "Afghan Hound", "lifespan": 13, "api_breed_name": "hound-afghan"},
    {"name": "Airedale Terrier", "lifespan": 12, "api_breed_name": "terrier-airedale"},
    {"name": "Akita", "lifespan": 12, "api_breed_name": "akita"},
    {"name": "Alaskan Klee Kai", "lifespan": 15, "api_breed_name": "husky"},
    {"name": "Alaskan Malamute", "lifespan": 13, "api_breed_name": "malamute"},
    {"name": "American Bulldog", "lifespan": 13, "api_breed_name": "bulldog-english"},
    {"name": "American English Coonhound", "lifespan": 11.5, "api_breed_name": "hound-english"},
    {"name": "American Eskimo Dog", "lifespan": 14, "api_breed_name": "eskimo"},
    {"name": "American Foxhound", "lifespan": 12.5, "api_breed_name": "hound-english"},
    {"name": "American Hairless Terrier", "lifespan": 15, "api_breed_name": "terrier-russell"},
    {"name": "American Leopard Hound", "lifespan": 13.5, "api_breed_name": "hound-blood"},
    {"name": "American Staffordshire Terrier", "lifespan": 14, "api_breed_name": "terrier-staffordshire"},
    {"name": "American Water Spaniel", "lifespan": 12, "api_breed_name": "spaniel-water"},
    {"name": "Anatolian Shepherd Dog", "lifespan": 12, "api_breed_name": "kuvasz"},
    {"name": "Australian Cattle Dog", "lifespan": 14, "api_breed_name": "cattledog-australian"},
    {"name": "Australian Shepherd", "lifespan": 13.5, "api_breed_name": "australian-shepherd"},
    {"name": "Australian Terrier", "lifespan": 13, "api_breed_name": "terrier-australian"},
    {"name": "Basenji", "lifespan": 13.5, "api_breed_name": "basenji"},
    {"name": "Basset Hound", "lifespan": 10, "api_breed_name": "hound-basset"},
    {"name": "Beagle", "lifespan": 12.5, "api_breed_name": "beagle"},
    {"name": "Bearded Collie", "lifespan": 13.5, "api_breed_name": "collie-border"},
    {"name": "Bernese Mountain Dog", "lifespan": 8.5, "api_breed_name": "mountain-bernese"},
    {"name": "Bichon Frise", "lifespan": 15, "api_breed_name": "bichon-frise"},
    {"name": "Bloodhound", "lifespan": 11, "api_breed_name": "hound-blood"},
    {"name": "Border Collie", "lifespan": 13.5, "api_breed_name": "collie-border"},
    {"name": "Boston Terrier", "lifespan": 12.5, "api_breed_name": "terrier-boston"},
    {"name": "Boxer", "lifespan": 11, "api_breed_name": "boxer"},
    {"name": "Brittany", "lifespan": 13, "api_breed_name": "spaniel-brittany"},
    {"name": "Brussels Griffon", "lifespan": 13.5, "api_breed_name": "griffon-brussels"},
    {"name": "Bull Terrier", "lifespan": 12.5, "api_breed_name": "terrier-bull"},
    {"name": "Bulldog", "lifespan": 9.5, "api_breed_name": "bulldog-english"},
    {"name": "Bullmastiff", "lifespan": 8, "api_breed_name": "mastiff-bull"},
    {"name": "Cairn Terrier", "lifespan": 13.5, "api_breed_name": "terrier-cairn"},
    {"name": "Cavalier King Charles Spaniel", "lifespan": 13.5, "api_breed_name": "spaniel-cocker"},
    {"name": "Chesapeake Bay Retriever", "lifespan": 10, "api_breed_name": "retriever-chesapeake"},
    {"name": "Chihuahua", "lifespan": 15, "api_breed_name": "chihuahua"},
    {"name": "Chinese Crested", "lifespan": 15, "api_breed_name": "chihuahua"},
    {"name": "Chinese Shar-Pei", "lifespan": 10, "api_breed_name": "sharpei"},
    {"name": "Chow Chow", "lifespan": 10, "api_breed_name": "chow"},
    {"name": "Cocker Spaniel", "lifespan": 12, "api_breed_name": "spaniel-cocker"},
    {"name": "Collie", "lifespan": 12, "api_breed_name": "collie-border"},
    {"name": "Dachshund", "lifespan": 14, "api_breed_name": "dachshund"},
    {"name": "Dalmatian", "lifespan": 12.5, "api_breed_name": "dalmatian"},
    {"name": "Doberman Pinscher", "lifespan": 11, "api_breed_name": "doberman"},
    {"name": "English Cocker Spaniel", "lifespan": 13, "api_breed_name": "spaniel-cocker"},
    {"name": "English Springer Spaniel", "lifespan": 13.5, "api_breed_name": "spaniel-english"},
    {"name": "French Bulldog", "lifespan": 12, "api_breed_name": "bulldog-french"},
    {"name": "German Shepherd Dog", "lifespan": 11, "api_breed_name": "germanshepherd"},
    {"name": "German Shorthaired Pointer", "lifespan": 13, "api_breed_name": "pointer-german"},
    {"name": "Golden Retriever", "lifespan": 11, "api_breed_name": "retriever-golden"},
    {"name": "Great Dane", "lifespan": 8, "api_breed_name": "dane-great"},
    {"name": "Greyhound", "lifespan": 13.5, "api_breed_name": "greyhound"},
    {"name": "Havanese", "lifespan": 15, "api_breed_name": "havanese"},
    {"name": "Husky", "lifespan": 13, "api_breed_name": "husky"},
    {"name": "Irish Setter", "lifespan": 13, "api_breed_name": "setter-irish"},
    {"name": "Irish Wolfhound", "lifespan": 7, "api_breed_name": "wolfhound-irish"},
    {"name": "Italian Greyhound", "lifespan": 14.5, "api_breed_name": "greyhound-italian"},
    {"name": "Japanese Chin", "lifespan": 11, "api_breed_name": "papillon"},
    {"name": "Labrador Retriever", "lifespan": 12, "api_breed_name": "retriever-labrador"},
    {"name": "Maltese", "lifespan": 13.5, "api_breed_name": "maltese"},
    {"name": "Mastiff", "lifespan": 8, "api_breed_name": "mastiff-english"},
    {"name": "Newfoundland", "lifespan": 9, "api_breed_name": "newfoundland"},
    {"name": "Papillon", "lifespan": 15, "api_breed_name": "papillon"},
    {"name": "Pekingese", "lifespan": 13, "api_breed_name": "pekingese"},
    {"name": "Pomeranian", "lifespan": 14, "api_breed_name": "pomeranian"},
    {"name": "Poodle", "lifespan": 13, "api_breed_name": "poodle-standard"},
    {"name": "Pug", "lifespan": 13.5, "api_breed_name": "pug"},
    {"name": "Rottweiler", "lifespan": 9.5, "api_breed_name": "rottweiler"},
    {"name": "Saint Bernard", "lifespan": 9, "api_breed_name": "stbernard"},
    {"name": "Samoyed", "lifespan": 13, "api_breed_name": "samoyed"},
    {"name": "Scottish Terrier", "lifespan": 13.5, "api_breed_name": "terrier-scottish"},
    {"name": "Shetland Sheepdog", "lifespan": 13.5, "api_breed_name": "sheepdog-shetland"},
    {"name": "Shiba Inu", "lifespan": 14.5, "api_breed_name": "shiba"},
    {"name": "Shih Tzu", "lifespan": 14, "api_breed_name": "shihtzu"},
    {"name": "Siberian Husky", "lifespan": 13, "api_breed_name": "husky"},
    {"name": "Vizsla", "lifespan": 12.5, "api_breed_name": "vizsla"},
    {"name": "Weimaraner", "lifespan": 12, "api_breed_name": "weimaraner"},
    {"name": "West Highland White Terrier", "lifespan": 14, "api_breed_name": "terrier-westhighland"},
    {"name": "Whippet", "lifespan": 13.5, "api_breed_name": "whippet"},
    {"name": "Yorkshire Terrier", "lifespan": 13, "api_breed_name": "terrier-yorkshire"}
]

@router.on_event("startup")
async def initialize_breeds():
    """Initialize dog breeds in database if not already present"""
    try:
        # Check if breeds already exist
        existing_count = await db.dog_breeds.count_documents({})
        if existing_count == 0:
            logger.info("Initializing dog breeds in database...")
            breeds_to_insert = []
            for breed_data in DOG_BREEDS_DATA:
                breed = DogBreed(
                    name=breed_data["name"],
                    lifespan=breed_data["lifespan"],
                    api_breed_name=breed_data["api_breed_name"]
                )
                breeds_to_insert.append(breed.dict())
            
            await db.dog_breeds.insert_many(breeds_to_insert)
            logger.info(f"Inserted {len(breeds_to_insert)} dog breeds into database")
        else:
            logger.info(f"Database already contains {existing_count} dog breeds")
    except Exception as e:
        logger.error(f"Error initializing breeds: {str(e)}")

@router.get("/breeds")
async def get_all_breeds():
    """Get all dog breeds with their lifespans"""
    try:
        breeds_cursor = db.dog_breeds.find({}).sort("name", 1)
        breeds = await breeds_cursor.to_list(length=None)
        
        # Convert ObjectId to string and format response
        breeds_list = []
        for breed in breeds:
            breeds_list.append({
                "name": breed["name"],
                "lifespan": breed["lifespan"],
                "api_breed_name": breed["api_breed_name"]
            })
        
        return {"breeds": breeds_list}
    except Exception as e:
        logger.error(f"Error fetching breeds: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch breeds")

@router.get("/breeds/{breed_name}/image")
async def get_breed_image(breed_name: str):
    """Get random image for a specific breed"""
    try:
        # Find breed in database
        breed = await db.dog_breeds.find_one({"name": breed_name})
        if not breed:
            raise HTTPException(status_code=404, detail="Breed not found")
        
        # Get image from Dog CEO API
        api_breed_name = breed["api_breed_name"]
        
        # Handle sub-breeds (e.g., "hound-afghan" -> breed="hound", sub_breed="afghan")
        if "-" in api_breed_name:
            parts = api_breed_name.split("-", 1)
            breed_part = parts[0]
            sub_breed_part = parts[1]
            image_url = await DogCEOService.get_breed_image(breed_part, sub_breed_part)
        else:
            image_url = await DogCEOService.get_breed_image(api_breed_name)
        
        if not image_url:
            # Fallback to a generic dog image
            image_url = "https://images.dog.ceo/breeds/retriever-golden/n02099601_7771.jpg"
        
        return {
            "breed_name": breed_name,
            "image_url": image_url,
            "lifespan": breed["lifespan"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching breed image: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch breed image")

@router.post("/calculate-age", response_model=CalculationResponse)
async def calculate_dog_age(request: CalculationRequest):
    """Calculate dog years based on age and breed"""
    try:
        # Find breed in database
        breed = await db.dog_breeds.find_one({"name": request.breed_name})
        if not breed:
            raise HTTPException(status_code=404, detail="Breed not found")
        
        # Calculate dog years
        dog_years, dog_years_string = AgeCalculatorService.calculate_dog_years(
            request.age_years, request.age_months, breed["lifespan"]
        )
        
        # Format actual age
        actual_age = AgeCalculatorService.format_actual_age(request.age_years, request.age_months)
        actual_age_decimal = request.age_years + (request.age_months / 12)
        
        # Create formula explanation
        formula_explanation = AgeCalculatorService.create_formula_explanation(
            request.age_years, request.age_months, breed["lifespan"]
        )
        
        # Get breed image
        api_breed_name = breed["api_breed_name"]
        if "-" in api_breed_name:
            parts = api_breed_name.split("-", 1)
            breed_part = parts[0]
            sub_breed_part = parts[1]
            image_url = await DogCEOService.get_breed_image(breed_part, sub_breed_part)
        else:
            image_url = await DogCEOService.get_breed_image(api_breed_name)
        
        if not image_url:
            # Fallback image
            image_url = "https://images.dog.ceo/breeds/retriever-golden/n02099601_7771.jpg"
        
        # Log calculation
        calculation_log = CalculationLog(
            breed_name=request.breed_name,
            age_years=request.age_years,
            age_months=request.age_months,
            dog_years=dog_years
        )
        await db.calculation_logs.insert_one(calculation_log.dict())
        
        # Return response
        return CalculationResponse(
            breed_name=request.breed_name,
            actual_age=actual_age,
            actual_age_decimal=actual_age_decimal,
            dog_years=dog_years_string,
            breed_lifespan=breed["lifespan"],
            image_url=image_url,
            formula_used=formula_explanation
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating dog age: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to calculate dog age")