# Dog Age Calculator - Backend Integration Contracts

## Current Frontend Implementation (Mock Data)
- ✅ Complete dog breed list with lifespans (70+ breeds from user's specification)
- ✅ Age input with years and months
- ✅ Dog years calculation using formula: B = A × (E/C) where E=78.8
- ✅ Warm earth tone design (beige, browns, whites)
- ✅ Mock breed images from Dog CEO API
- ✅ Results display with breed info, lifespan, and calculated dog years

## API Contracts for Backend Integration

### 1. GET /api/breeds
**Purpose**: Get all available dog breeds with their lifespans
**Response**:
```json
{
  "breeds": [
    {
      "name": "Golden Retriever",
      "lifespan": 11,
      "api_breed_name": "retriever-golden"
    }
  ]
}
```

### 2. GET /api/breeds/{breed_name}/image
**Purpose**: Get random breed image from Dog CEO API
**Response**:
```json
{
  "breed_name": "Golden Retriever",
  "image_url": "https://images.dog.ceo/breeds/retriever-golden/n02099601_7771.jpg",
  "lifespan": 11
}
```

### 3. POST /api/calculate-age
**Purpose**: Calculate dog years based on age and breed
**Request**:
```json
{
  "breed_name": "Golden Retriever",
  "age_years": 5,
  "age_months": 3
}
```
**Response**:
```json
{
  "breed_name": "Golden Retriever",
  "actual_age": "5 years 3 months",
  "actual_age_decimal": 5.25,
  "dog_years": "36.8",
  "breed_lifespan": 11,
  "image_url": "https://images.dog.ceo/breeds/retriever-golden/n02099601_7771.jpg",
  "formula_used": "Dog Years = 5.25 × (78.8 ÷ 11)"
}
```

## Backend Implementation Plan

### Models
- **DogBreed**: Store breed names, lifespans, and Dog CEO API mapping
- **CalculationRequest**: Log user calculations (optional for analytics)

### Services
- **DogCEOService**: Interface with Dog CEO API
- **AgeCalculatorService**: Handle dog years calculations
- **BreedMappingService**: Map user breed names to Dog CEO API breed names

### Database Schema
```python
class DogBreed(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str  # "Golden Retriever"
    lifespan: float  # 11.0
    api_breed_name: str  # "retriever-golden"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CalculationLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    breed_name: str
    age_years: int
    age_months: int
    dog_years: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
```

## Frontend Changes for Backend Integration

### Remove Mock Data
- Replace `mockData.js` imports with API calls
- Update `DogAgeCalculator.jsx` to use backend endpoints

### API Integration Points
1. **Component Mount**: Fetch breeds list from `/api/breeds`
2. **Breed Selection**: Optionally fetch breed image from `/api/breeds/{breed}/image`  
3. **Calculate Button**: POST to `/api/calculate-age` and display results

### Error Handling
- Network errors
- Invalid breed selection
- API rate limiting from Dog CEO
- Image loading failures

## Dog CEO API Integration Details

### Breed Name Mapping Challenges
- User list: "Golden Retriever" 
- Dog CEO API: "retriever-golden"
- Need mapping service to convert between formats

### Sample Dog CEO Endpoints
- `https://dog.ceo/api/breeds/list/all` - Get all breeds
- `https://dog.ceo/api/breed/{breed}/images/random` - Get random breed image

## Implementation Priority
1. Create dog breeds database with lifespan data
2. Build breed name mapping to Dog CEO API
3. Implement calculation endpoint
4. Integrate Dog CEO API for images  
5. Update frontend to use backend APIs
6. Add error handling and loading states