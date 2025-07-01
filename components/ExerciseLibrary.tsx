'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Play, Bookmark, CheckCircle, Clock, Flame, Award, ArrowRight, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  exerciseCategories, 
  exercises as allExercises, 
  getExercisesByCategory,
  searchExercises,
  type Exercise,
  type ExerciseCategory 
} from '@/lib/exercise-data';

export default function ExerciseLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [savedExercises, setSavedExercises] = useState<Set<string>>(new Set());
  const [recentlyViewed, setRecentlyViewed] = useState<Exercise[]>([]);

  // Load saved exercises from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedExercises');
    if (saved) {
      setSavedExercises(new Set(JSON.parse(saved)));
    }
    
    const viewed = localStorage.getItem('recentlyViewedExercises');
    if (viewed) {
      setRecentlyViewed(JSON.parse(viewed));
    }
  }, []);

  // Filter exercises based on search and category
  useEffect(() => {
    let result: Exercise[] = [];
    
    if (searchQuery.trim()) {
      result = searchExercises(searchQuery);
    } else if (selectedCategory === 'all') {
      result = Object.values(allExercises).flat();
    } else {
      result = getExercisesByCategory(selectedCategory);
    }
    
    setFilteredExercises(result);
  }, [searchQuery, selectedCategory]);

  // Handle exercise selection
  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    
    // Add to recently viewed
    const updatedRecentlyViewed = [
      exercise,
      ...recentlyViewed.filter(ex => ex.id !== exercise.id)
    ].slice(0, 5);
    
    setRecentlyViewed(updatedRecentlyViewed);
    localStorage.setItem('recentlyViewedExercises', JSON.stringify(updatedRecentlyViewed));
  };

  // Toggle save exercise
  const toggleSaveExercise = (e: React.MouseEvent<HTMLButtonElement>, exerciseId: string) => {
    e.stopPropagation();
    const newSavedExercises = new Set(savedExercises);
    
    if (newSavedExercises.has(exerciseId)) {
      newSavedExercises.delete(exerciseId);
    } else {
      newSavedExercises.add(exerciseId);
    }
    
    setSavedExercises(newSavedExercises);
    localStorage.setItem('savedExercises', JSON.stringify(Array.from(newSavedExercises)));
  };

  // Start exercise timer
  const startExercise = () => {
    setIsPlaying(true);
    setProgress(0);
    
    const duration = selectedExercise?.duration ? 
      parseInt(selectedExercise.duration) * 60 * 1000 : // Convert minutes to ms
      60000; // Default 1 minute
    
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    const timer = setInterval(() => {
      const now = Date.now();
      const newProgress = Math.min(100, ((now - startTime) / duration) * 100);
      setProgress(newProgress);
      
      if (now >= endTime) {
        clearInterval(timer);
        setIsPlaying(false);
        // Mark as completed if in progress tracking mode
      }
    }, 100);
    
    return () => clearInterval(timer);
  };

  // Render exercise card
  const renderExerciseCard = (exercise: Exercise) => (
    <Card 
      key={exercise.id} 
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedExercise?.id === exercise.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => handleExerciseSelect(exercise)}
    >
      <div className="relative">
        <img 
          src={exercise.imageUrl} 
          alt={exercise.name} 
          className="w-full h-40 object-cover rounded-t-lg"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-black/80 text-white hover:bg-black/90 text-xs px-2 py-1 rounded">
            {exercise.difficulty}
          </span>
        </div>
        <button 
          className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            toggleSaveExercise(e, exercise.id);
          }}
        >
          <Bookmark 
            className={`h-5 w-5 ${savedExercises.has(exercise.id) ? 'fill-yellow-400 text-yellow-500' : 'text-gray-400'}`} 
          />
        </button>
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-semibold line-clamp-2 h-14">
          {exercise.name}
        </CardTitle>
        <div className="flex flex-wrap gap-1 mt-2">
          {exercise.targetAreas.slice(0, 3).map((area, index) => (
            <div key={index} className="text-xs border rounded-full px-2 py-0.5">
              {area}
            </div>
          ))}
          {exercise.targetAreas.length > 3 && (
            <span className="text-xs border rounded-full px-2 py-0.5">
              +{exercise.targetAreas.length - 3}
            </span>
          )}
        </div>
      </CardHeader>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>{exercise.duration || '5 min'}</span>
        </div>
        <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700">
          View <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Exercise Library</h1>
        <p className="text-gray-600">Browse and select exercises for your rehabilitation program</p>
      </div>
      
      {/* Search and Filter */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search exercises..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <Button 
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="whitespace-nowrap"
            >
              All Exercises
            </Button>
            {exerciseCategories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Exercise List */}
        <div className="lg:col-span-3">
          {searchQuery && filteredExercises.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No exercises found for "{searchQuery}"</p>
              <Button 
                variant="ghost" 
                className="mt-4"
                onClick={() => setSearchQuery('')}
              >
                Clear search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExercises.map(exercise => renderExerciseCard(exercise))}
            </div>
          )}
        </div>

        {/* Exercise Detail Panel */}
        <div className="lg:col-span-1 space-y-6">
          {selectedExercise ? (
            <Card className="sticky top-6">
              <div className="relative">
                <img 
                  src={selectedExercise.imageUrl} 
                  alt={selectedExercise.name} 
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h2 className="text-xl font-bold">{selectedExercise.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-sm">
                      {selectedExercise.difficulty}
                    </div>
                    <span className="text-sm text-white/80">
                      {selectedExercise.duration || '5 min'}
                    </span>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Target Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedExercise.targetAreas.map(area => (
                      <div key={area} className="border rounded-full px-2 py-0.5 text-sm">
                        {area}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Instructions</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    {selectedExercise.instructions.map((step, i) => (
                      <li key={i} className="pl-2">{step}</li>
                    ))}
                  </ol>
                </div>
                
                {selectedExercise.precautions && selectedExercise.precautions.length > 0 && (
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                    <h3 className="font-semibold text-yellow-800 mb-1">Precautions</h3>
                    <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                      {selectedExercise.precautions.map((precaution, i) => (
                        <li key={i}>{precaution}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="pt-2">
                  <Button 
                    className="w-full bg-black text-white hover:bg-gray-800"
                    onClick={startExercise}
                    disabled={isPlaying}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isPlaying ? 'In Progress...' : 'Start Exercise'}
                  </Button>
                  
                  {isPlaying && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">No Exercise Selected</h3>
              <p className="text-sm text-gray-500">Select an exercise to view details and instructions</p>
            </Card>
          )}
          
          {/* Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recently Viewed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentlyViewed.slice(0, 3).map(exercise => (
                  <div 
                    key={exercise.id} 
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleExerciseSelect(exercise)}
                  >
                    <img 
                      src={exercise.imageUrl} 
                      alt={exercise.name}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{exercise.name}</p>
                      <p className="text-xs text-gray-500">{exercise.difficulty}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
