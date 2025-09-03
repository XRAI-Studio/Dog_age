from typing import Tuple
import logging

logger = logging.getLogger(__name__)

class AgeCalculatorService:
    HUMAN_AVERAGE_LIFESPAN = 78.8
    
    @staticmethod
    def calculate_dog_years(age_years: int, age_months: int, breed_lifespan: float) -> Tuple[float, str]:
        """
        Calculate dog years using the formula: B = A * (E/C)
        Where:
        B = Dog years
        A = Actual age in years
        E = Human average lifespan (78.8)
        C = Breed average lifespan
        
        Returns: (dog_years_float, dog_years_string)
        """
        try:
            # Convert age to decimal years
            actual_age_decimal = age_years + (age_months / 12)
            
            # Calculate dog years
            dog_years = actual_age_decimal * (AgeCalculatorService.HUMAN_AVERAGE_LIFESPAN / breed_lifespan)
            
            # Format dog years string
            dog_years_string = f"{dog_years:.1f}"
            
            logger.info(f"Calculated dog years: {dog_years_string} for age {actual_age_decimal} years, breed lifespan {breed_lifespan}")
            
            return dog_years, dog_years_string
            
        except Exception as e:
            logger.error(f"Error calculating dog years: {str(e)}")
            return 0.0, "0.0"
    
    @staticmethod
    def format_actual_age(age_years: int, age_months: int) -> str:
        """Format actual age as human-readable string"""
        if age_months == 0:
            return f"{age_years} years"
        elif age_years == 0:
            return f"{age_months} months"
        else:
            return f"{age_years} years {age_months} months"
    
    @staticmethod
    def create_formula_explanation(age_years: int, age_months: int, breed_lifespan: float) -> str:
        """Create formula explanation string"""
        actual_age_decimal = age_years + (age_months / 12)
        return f"{actual_age_decimal:.2f} × (78.8 ÷ {breed_lifespan})"