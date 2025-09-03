import aiohttp
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class DogCEOService:
    BASE_URL = "https://dog.ceo/api"
    
    @staticmethod
    async def get_all_breeds() -> Dict:
        """Get all breeds from Dog CEO API"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{DogCEOService.BASE_URL}/breeds/list/all") as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get("message", {})
                    else:
                        logger.error(f"Failed to fetch breeds: {response.status}")
                        return {}
        except Exception as e:
            logger.error(f"Error fetching breeds from Dog CEO API: {str(e)}")
            return {}
    
    @staticmethod
    async def get_breed_image(breed_name: str, sub_breed: str = None) -> Optional[str]:
        """Get random image for a specific breed"""
        try:
            if sub_breed:
                url = f"{DogCEOService.BASE_URL}/breed/{breed_name}/{sub_breed}/images/random"
            else:
                url = f"{DogCEOService.BASE_URL}/breed/{breed_name}/images/random"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get("message")
                    else:
                        logger.warning(f"Failed to fetch image for {breed_name}: {response.status}")
                        return None
        except Exception as e:
            logger.error(f"Error fetching image for {breed_name}: {str(e)}")
            return None
    
    @staticmethod
    def create_breed_mapping() -> Dict[str, str]:
        """Create mapping between user breed names and Dog CEO API breed names"""
        return {
            # A-C
            "Affenpinscher": "affenpinscher",
            "Afghan Hound": "hound-afghan",
            "Airedale Terrier": "terrier-airedale",
            "Akita": "akita",
            "Alaskan Klee Kai": "husky",  # Closest match
            "Alaskan Malamute": "malamute",
            "American Bulldog": "bulldog-english",  # Closest match
            "American English Coonhound": "hound-english",
            "American Eskimo Dog": "eskimo",
            "American Foxhound": "hound-english",  # Closest match
            "American Hairless Terrier": "terrier-russell",  # Closest match
            "American Leopard Hound": "hound-blood",  # Closest match
            "American Staffordshire Terrier": "terrier-staffordshire",
            "American Water Spaniel": "spaniel-water",
            "Anatolian Shepherd Dog": "kuvasz",  # Closest match
            "Australian Cattle Dog": "cattledog-australian",
            "Australian Shepherd": "australian-shepherd",
            "Australian Terrier": "terrier-australian",
            "Basenji": "basenji",
            "Basset Hound": "hound-basset",
            "Beagle": "beagle",
            "Bearded Collie": "collie-border",  # Closest match
            "Bernese Mountain Dog": "mountain-bernese",
            "Bichon Frise": "bichon-frise",
            "Bloodhound": "hound-blood",
            "Border Collie": "collie-border",
            "Boston Terrier": "terrier-boston",
            "Boxer": "boxer",
            "Brittany": "spaniel-brittany",
            "Brussels Griffon": "griffon-brussels",
            "Bull Terrier": "terrier-bull",
            "Bulldog": "bulldog-english",
            "Bullmastiff": "mastiff-bull",
            "Cairn Terrier": "terrier-cairn",
            "Cavalier King Charles Spaniel": "spaniel-cocker",  # Closest match
            "Chesapeake Bay Retriever": "retriever-chesapeake",
            "Chihuahua": "chihuahua",
            "Chinese Crested": "chihuahua",  # Closest match
            "Chinese Shar-Pei": "sharpei",
            "Chow Chow": "chow",
            "Cocker Spaniel": "spaniel-cocker",
            "Collie": "collie-border",
            
            # D-G
            "Dachshund": "dachshund",
            "Dalmatian": "dalmatian",
            "Doberman Pinscher": "doberman",
            "English Cocker Spaniel": "spaniel-cocker",
            "English Springer Spaniel": "spaniel-english",
            "French Bulldog": "bulldog-french",
            "German Shepherd Dog": "germanshepherd",
            "German Shorthaired Pointer": "pointer-german",
            "Golden Retriever": "retriever-golden",
            "Great Dane": "dane-great",
            "Greyhound": "greyhound",
            
            # H-M
            "Havanese": "havanese",
            "Husky": "husky",
            "Irish Setter": "setter-irish",
            "Irish Wolfhound": "wolfhound-irish",
            "Italian Greyhound": "greyhound-italian",
            "Japanese Chin": "papillon",  # Closest match
            "Labrador Retriever": "retriever-labrador",
            "Maltese": "maltese",
            "Mastiff": "mastiff-english",
            
            # N-P
            "Newfoundland": "newfoundland",
            "Papillon": "papillon",
            "Pekingese": "pekingese",
            "Pomeranian": "pomeranian",
            "Poodle": "poodle-standard",
            "Pug": "pug",
            
            # R-S
            "Rottweiler": "rottweiler",
            "Saint Bernard": "stbernard",
            "Samoyed": "samoyed",
            "Scottish Terrier": "terrier-scottish",
            "Shetland Sheepdog": "sheepdog-shetland",
            "Shiba Inu": "shiba",
            "Shih Tzu": "shihtzu",
            "Siberian Husky": "husky",
            
            # V-Y
            "Vizsla": "vizsla",
            "Weimaraner": "weimaraner",
            "West Highland White Terrier": "terrier-westhighland",
            "Whippet": "whippet",
            "Yorkshire Terrier": "terrier-yorkshire"
        }