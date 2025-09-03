import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dog, Calendar, Heart, Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DogAgeCalculator = () => {
  const [breeds, setBreeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [selectedBreed, setSelectedBreed] = useState('');
  const [ageYears, setAgeYears] = useState('');
  const [ageMonths, setAgeMonths] = useState('0');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Fetch breeds on component mount
  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/breeds`);
        setBreeds(response.data.breeds);
        setError('');
      } catch (err) {
        console.error('Error fetching breeds:', err);
        setError('Failed to load dog breeds. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBreeds();
  }, []);

  const handleCalculate = async () => {
    if (!selectedBreed || !ageYears) return;

    try {
      setCalculating(true);
      setError('');
      
      const response = await axios.post(`${API}/calculate-age`, {
        breed_name: selectedBreed,
        age_years: parseInt(ageYears),
        age_months: parseInt(ageMonths)
      });

      setResult(response.data);
    } catch (err) {
      console.error('Error calculating dog age:', err);
      setError('Failed to calculate dog age. Please try again.');
    } finally {
      setCalculating(false);
    }
  };

  const handleReset = () => {
    setSelectedBreed('');
    setAgeYears('');
    setAgeMonths('0');
    setResult(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-amber-700 text-lg">Loading dog breeds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Dog className="w-8 h-8 text-amber-700" />
            <h1 className="text-4xl font-bold text-amber-900">True Dog Age</h1>
            <Dog className="w-8 h-8 text-amber-700" />
          </div>
          <p className="text-sm text-amber-600 mb-3">Created by XRAI Studio</p>
          <p className="text-lg text-amber-700 max-w-2xl mx-auto">
            Convert your dog's age to "dog years" based on their breed's average lifespan
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="shadow-lg border-amber-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-lg">
              <CardTitle className="text-2xl text-amber-800 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Calculate Dog Years
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Breed Selection */}
              <div className="space-y-2">
                <Label htmlFor="breed" className="text-lg font-semibold text-amber-800">
                  Select Dog Breed (D)
                </Label>
                <Select value={selectedBreed} onValueChange={setSelectedBreed}>
                  <SelectTrigger className="border-amber-300 focus:border-amber-500">
                    <SelectValue placeholder="Choose your dog's breed..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {breeds.map((breed) => (
                      <SelectItem key={breed.name} value={breed.name}>
                        {breed.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Age Input */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-amber-800">
                  Dog's Age (A)
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="years" className="text-amber-700">Years</Label>
                    <Input
                      id="years"
                      type="number"
                      min="0"
                      max="30"
                      value={ageYears}
                      onChange={(e) => setAgeYears(e.target.value)}
                      placeholder="0"
                      className="border-amber-300 focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="months" className="text-amber-700">Months</Label>
                    <Select value={ageMonths} onValueChange={setAgeMonths}>
                      <SelectTrigger className="border-amber-300 focus:border-amber-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 12}, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={handleCalculate}
                  disabled={!selectedBreed || !ageYears || calculating}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 text-lg transition-all duration-300 transform hover:scale-105"
                >
                  {calculating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Calculating...
                    </>
                  ) : (
                    'Calculate Dog Years'
                  )}
                </Button>
                <Button 
                  onClick={handleReset}
                  variant="outline"
                  disabled={calculating}
                  className="border-amber-600 text-amber-700 hover:bg-amber-50 font-semibold transition-all duration-300"
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Display */}
          <Card className="shadow-lg border-amber-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-t-lg">
              <CardTitle className="text-2xl text-amber-800 flex items-center gap-2">
                <Heart className="w-6 h-6" />
                Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {result ? (
                <div className="space-y-6">
                  {/* Breed Image */}
                  <div className="text-center">
                    <img
                      src={result.image_url}
                      alt={result.breed_name}
                      className="w-44 h-44 object-cover rounded-lg mx-auto shadow-lg border-4 border-amber-200"
                      onError={(e) => {
                        e.target.src = "https://images.dog.ceo/breeds/retriever-golden/n02099601_7771.jpg";
                      }}
                    />
                    <h3 className="text-2xl font-bold text-amber-800 mt-4">{result.breed_name}</h3>
                  </div>

                  {/* Results Grid */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-4 rounded-lg border border-amber-200">
                      <div className="text-sm text-amber-700 font-medium">Actual Age (A)</div>
                      <div className="text-2xl font-bold text-amber-800">{result.actual_age}</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-4 rounded-lg border border-amber-200">
                      <div className="text-sm text-amber-700 font-medium">Dog Years (B)</div>
                      <div className="text-3xl font-bold text-amber-800">{result.dog_years} years</div>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-100 to-amber-100 p-4 rounded-lg border border-amber-200">
                      <div className="text-sm text-amber-700 font-medium">Average Breed Lifespan (C)</div>
                      <div className="text-2xl font-bold text-amber-800">{result.breed_lifespan} years</div>
                    </div>
                  </div>

                  {/* Formula Explanation */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                    <h4 className="font-semibold text-amber-800 mb-2">Formula Used:</h4>
                    <p className="text-amber-700 text-sm">
                      Dog Years (B) = Actual Age (A) × (Human Average Lifespan / Breed Lifespan)
                    </p>
                    <p className="text-amber-700 text-sm mt-1">
                      {result.dog_years} = {result.formula_used}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Dog className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                  <p className="text-amber-600 text-lg">
                    Select a breed and enter your dog's age to see the results
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="text-center py-6 text-amber-700">
          <p className="text-sm">
            Formula: Dog Years = Age × (Human Average Lifespan ÷ Breed Average Lifespan)
          </p>
          <p className="text-xs mt-2 opacity-75">
            Using Human Average Lifespan: 78.8 years. Dog Years are +/-10%
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DogAgeCalculator;