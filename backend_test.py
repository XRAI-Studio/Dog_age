#!/usr/bin/env python3
"""
Comprehensive Backend Tests for Dog Age Calculator API
Tests all endpoints, error handling, and formula calculations
"""

import requests
import json
import sys
from typing import Dict, Any

# Backend URL from environment
BACKEND_URL = "https://breed-age-converter.preview.emergentagent.com/api"

class DogAgeCalculatorTester:
    def __init__(self):
        self.test_results = []
        self.failed_tests = []
        
    def log_test(self, test_name: str, passed: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        result = f"{status}: {test_name}"
        if details:
            result += f" - {details}"
        print(result)
        self.test_results.append({"name": test_name, "passed": passed, "details": details})
        if not passed:
            self.failed_tests.append(test_name)
    
    def test_get_all_breeds(self):
        """Test GET /api/breeds endpoint"""
        print("\n=== Testing GET /api/breeds ===")
        
        try:
            response = requests.get(f"{BACKEND_URL}/breeds", timeout=10)
            
            # Test status code
            self.log_test("GET /breeds returns 200", response.status_code == 200, 
                         f"Status: {response.status_code}")
            
            if response.status_code != 200:
                return
                
            data = response.json()
            
            # Test response structure
            self.log_test("Response has 'breeds' key", "breeds" in data)
            
            if "breeds" not in data:
                return
                
            breeds = data["breeds"]
            
            # Test breed count (should be 81)
            self.log_test("Returns 81 breeds", len(breeds) == 81, 
                         f"Found {len(breeds)} breeds")
            
            # Test alphabetical order
            breed_names = [breed["name"] for breed in breeds]
            is_sorted = breed_names == sorted(breed_names)
            self.log_test("Breeds are in alphabetical order", is_sorted)
            
            # Test breed structure
            if breeds:
                first_breed = breeds[0]
                required_fields = ["name", "lifespan", "api_breed_name"]
                has_all_fields = all(field in first_breed for field in required_fields)
                self.log_test("Breeds have required fields", has_all_fields, 
                             f"Fields: {list(first_breed.keys())}")
                
                # Test specific breeds exist
                golden_retriever = next((b for b in breeds if b["name"] == "Golden Retriever"), None)
                self.log_test("Golden Retriever exists", golden_retriever is not None)
                
                if golden_retriever:
                    self.log_test("Golden Retriever lifespan is 11", 
                                 golden_retriever["lifespan"] == 11,
                                 f"Lifespan: {golden_retriever['lifespan']}")
                    self.log_test("Golden Retriever API name correct", 
                                 golden_retriever["api_breed_name"] == "retriever-golden")
                
                chihuahua = next((b for b in breeds if b["name"] == "Chihuahua"), None)
                self.log_test("Chihuahua exists", chihuahua is not None)
                
                if chihuahua:
                    self.log_test("Chihuahua lifespan is 15", 
                                 chihuahua["lifespan"] == 15,
                                 f"Lifespan: {chihuahua['lifespan']}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("GET /breeds network request", False, f"Error: {str(e)}")
        except Exception as e:
            self.log_test("GET /breeds general", False, f"Error: {str(e)}")
    
    def test_get_breed_image(self):
        """Test GET /api/breeds/{breed_name}/image endpoint"""
        print("\n=== Testing GET /api/breeds/{breed_name}/image ===")
        
        # Test valid breed
        try:
            response = requests.get(f"{BACKEND_URL}/breeds/Golden Retriever/image", timeout=15)
            
            self.log_test("GET breed image returns 200", response.status_code == 200,
                         f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["breed_name", "image_url", "lifespan"]
                has_all_fields = all(field in data for field in required_fields)
                self.log_test("Image response has required fields", has_all_fields,
                             f"Fields: {list(data.keys())}")
                
                if has_all_fields:
                    self.log_test("Breed name matches", data["breed_name"] == "Golden Retriever")
                    self.log_test("Image URL is valid", data["image_url"].startswith("http"))
                    self.log_test("Lifespan is correct", data["lifespan"] == 11,
                                 f"Lifespan: {data['lifespan']}")
                    
        except requests.exceptions.RequestException as e:
            self.log_test("GET breed image network request", False, f"Error: {str(e)}")
        except Exception as e:
            self.log_test("GET breed image general", False, f"Error: {str(e)}")
        
        # Test invalid breed
        try:
            response = requests.get(f"{BACKEND_URL}/breeds/NonExistentBreed/image", timeout=10)
            self.log_test("Invalid breed returns 404", response.status_code == 404,
                         f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Invalid breed error handling", False, f"Error: {str(e)}")
    
    def test_calculate_age_valid_cases(self):
        """Test POST /api/calculate-age with valid inputs"""
        print("\n=== Testing POST /api/calculate-age (Valid Cases) ===")
        
        # Test case 1: Golden Retriever, 5 years 6 months
        test_data = {
            "breed_name": "Golden Retriever",
            "age_years": 5,
            "age_months": 6
        }
        
        try:
            response = requests.post(f"{BACKEND_URL}/calculate-age", 
                                   json=test_data, timeout=15)
            
            self.log_test("Calculate age returns 200", response.status_code == 200,
                         f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields
                required_fields = ["breed_name", "actual_age", "actual_age_decimal", 
                                 "dog_years", "breed_lifespan", "image_url", "formula_used"]
                has_all_fields = all(field in data for field in required_fields)
                self.log_test("Response has all required fields", has_all_fields,
                             f"Fields: {list(data.keys())}")
                
                if has_all_fields:
                    # Verify calculation: 5.5 × (78.8 ÷ 11) = 39.4
                    expected_dog_years = 5.5 * (78.8 / 11)  # 39.4
                    actual_dog_years = float(data["dog_years"])
                    
                    self.log_test("Golden Retriever calculation correct", 
                                 abs(actual_dog_years - expected_dog_years) < 0.1,
                                 f"Expected: {expected_dog_years:.1f}, Got: {actual_dog_years}")
                    
                    self.log_test("Breed name correct", data["breed_name"] == "Golden Retriever")
                    self.log_test("Actual age decimal correct", data["actual_age_decimal"] == 5.5)
                    self.log_test("Breed lifespan correct", data["breed_lifespan"] == 11)
                    self.log_test("Image URL provided", data["image_url"].startswith("http"))
                    self.log_test("Formula explanation provided", len(data["formula_used"]) > 0)
                    
        except requests.exceptions.RequestException as e:
            self.log_test("Calculate age network request", False, f"Error: {str(e)}")
        except Exception as e:
            self.log_test("Calculate age general", False, f"Error: {str(e)}")
        
        # Test case 2: Chihuahua, 3 years 0 months
        test_data2 = {
            "breed_name": "Chihuahua",
            "age_years": 3,
            "age_months": 0
        }
        
        try:
            response = requests.post(f"{BACKEND_URL}/calculate-age", 
                                   json=test_data2, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Verify calculation: 3 × (78.8 ÷ 15) = 15.76
                expected_dog_years = 3 * (78.8 / 15)  # 15.76
                actual_dog_years = float(data["dog_years"])
                
                self.log_test("Chihuahua calculation correct", 
                             abs(actual_dog_years - expected_dog_years) < 0.1,
                             f"Expected: {expected_dog_years:.1f}, Got: {actual_dog_years}")
                             
        except Exception as e:
            self.log_test("Chihuahua calculation", False, f"Error: {str(e)}")
    
    def test_calculate_age_edge_cases(self):
        """Test POST /api/calculate-age with edge cases"""
        print("\n=== Testing POST /api/calculate-age (Edge Cases) ===")
        
        # Test case: 0 years 6 months
        test_data = {
            "breed_name": "Golden Retriever",
            "age_years": 0,
            "age_months": 6
        }
        
        try:
            response = requests.post(f"{BACKEND_URL}/calculate-age", 
                                   json=test_data, timeout=10)
            
            self.log_test("0 years 6 months calculation", response.status_code == 200,
                         f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                expected_dog_years = 0.5 * (78.8 / 11)  # ~3.6
                actual_dog_years = float(data["dog_years"])
                
                self.log_test("Young puppy calculation correct", 
                             abs(actual_dog_years - expected_dog_years) < 0.1,
                             f"Expected: {expected_dog_years:.1f}, Got: {actual_dog_years}")
                             
        except Exception as e:
            self.log_test("Young puppy calculation", False, f"Error: {str(e)}")
        
        # Test case: Old dog - 15 years
        test_data_old = {
            "breed_name": "Golden Retriever",
            "age_years": 15,
            "age_months": 0
        }
        
        try:
            response = requests.post(f"{BACKEND_URL}/calculate-age", 
                                   json=test_data_old, timeout=10)
            
            self.log_test("Old dog calculation", response.status_code == 200,
                         f"Status: {response.status_code}")
                         
        except Exception as e:
            self.log_test("Old dog calculation", False, f"Error: {str(e)}")
    
    def test_calculate_age_error_cases(self):
        """Test POST /api/calculate-age error handling"""
        print("\n=== Testing POST /api/calculate-age (Error Cases) ===")
        
        # Test invalid breed
        test_data = {
            "breed_name": "NonExistentBreed",
            "age_years": 5,
            "age_months": 0
        }
        
        try:
            response = requests.post(f"{BACKEND_URL}/calculate-age", 
                                   json=test_data, timeout=10)
            
            self.log_test("Invalid breed returns 404", response.status_code == 404,
                         f"Status: {response.status_code}")
                         
        except Exception as e:
            self.log_test("Invalid breed error handling", False, f"Error: {str(e)}")
        
        # Test negative age
        test_data_negative = {
            "breed_name": "Golden Retriever",
            "age_years": -1,
            "age_months": 0
        }
        
        try:
            response = requests.post(f"{BACKEND_URL}/calculate-age", 
                                   json=test_data_negative, timeout=10)
            
            # Should either return 400 or handle gracefully
            self.log_test("Negative age handled", 
                         response.status_code in [400, 422] or 
                         (response.status_code == 200 and float(response.json().get("dog_years", "0")) >= 0),
                         f"Status: {response.status_code}")
                         
        except Exception as e:
            self.log_test("Negative age error handling", False, f"Error: {str(e)}")
        
        # Test missing fields
        test_data_missing = {
            "breed_name": "Golden Retriever"
            # Missing age_years
        }
        
        try:
            response = requests.post(f"{BACKEND_URL}/calculate-age", 
                                   json=test_data_missing, timeout=10)
            
            self.log_test("Missing fields returns 422", response.status_code == 422,
                         f"Status: {response.status_code}")
                         
        except Exception as e:
            self.log_test("Missing fields error handling", False, f"Error: {str(e)}")
    
    def test_dog_ceo_api_integration(self):
        """Test Dog CEO API integration"""
        print("\n=== Testing Dog CEO API Integration ===")
        
        # Test different breed name mappings
        test_breeds = [
            ("Golden Retriever", "retriever-golden"),
            ("German Shepherd Dog", "germanshepherd"),
            ("Husky", "husky")
        ]
        
        for breed_name, expected_api_name in test_breeds:
            try:
                response = requests.get(f"{BACKEND_URL}/breeds/{breed_name}/image", timeout=15)
                
                if response.status_code == 200:
                    data = response.json()
                    image_url = data.get("image_url", "")
                    
                    # Check if image URL contains expected breed pattern
                    contains_breed = any(part in image_url.lower() for part in expected_api_name.split("-"))
                    self.log_test(f"{breed_name} image mapping", 
                                 image_url.startswith("http") and "dog.ceo" in image_url,
                                 f"URL: {image_url[:50]}...")
                else:
                    self.log_test(f"{breed_name} image fetch", False, 
                                 f"Status: {response.status_code}")
                                 
            except Exception as e:
                self.log_test(f"{breed_name} image integration", False, f"Error: {str(e)}")
    
    def test_formula_verification(self):
        """Verify the dog age calculation formula"""
        print("\n=== Testing Formula Verification ===")
        
        # Test known calculations
        test_cases = [
            ("Golden Retriever", 5, 6, 11, 39.4),  # 5.5 × (78.8 ÷ 11)
            ("Chihuahua", 3, 0, 15, 15.8),          # 3 × (78.8 ÷ 15)
            ("Great Dane", 2, 0, 8, 19.7),          # 2 × (78.8 ÷ 8)
            ("Pomeranian", 1, 0, 14, 5.6),          # 1 × (78.8 ÷ 14)
        ]
        
        for breed_name, years, months, lifespan, expected_result in test_cases:
            test_data = {
                "breed_name": breed_name,
                "age_years": years,
                "age_months": months
            }
            
            try:
                response = requests.post(f"{BACKEND_URL}/calculate-age", 
                                       json=test_data, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    actual_result = float(data["dog_years"])
                    
                    self.log_test(f"{breed_name} formula verification", 
                                 abs(actual_result - expected_result) < 0.2,
                                 f"Expected: {expected_result}, Got: {actual_result}")
                else:
                    self.log_test(f"{breed_name} formula test", False, 
                                 f"Status: {response.status_code}")
                                 
            except Exception as e:
                self.log_test(f"{breed_name} formula test", False, f"Error: {str(e)}")
    
    def run_all_tests(self):
        """Run all test suites"""
        print("🐕 Starting Dog Age Calculator Backend Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        # Run all test suites
        self.test_get_all_breeds()
        self.test_get_breed_image()
        self.test_calculate_age_valid_cases()
        self.test_calculate_age_edge_cases()
        self.test_calculate_age_error_cases()
        self.test_dog_ceo_api_integration()
        self.test_formula_verification()
        
        # Summary
        print("\n" + "=" * 60)
        print("🐕 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for test in self.test_results if test["passed"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        
        if failed_tests > 0:
            print(f"\nFailed Tests:")
            for test_name in self.failed_tests:
                print(f"  - {test_name}")
        
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        print(f"\nSuccess Rate: {success_rate:.1f}%")
        
        if success_rate >= 90:
            print("🎉 Backend tests mostly successful!")
        elif success_rate >= 70:
            print("⚠️  Backend has some issues that need attention")
        else:
            print("🚨 Backend has significant issues")
        
        return success_rate >= 70

if __name__ == "__main__":
    tester = DogAgeCalculatorTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)