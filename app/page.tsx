'use client';

import { useState, useEffect } from 'react';
import { SearchComponent } from '@/components/ui/search';
import { Heart, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FavoriteRemedy {
  id: string;
  name: string;
  category: string;
}

export default function Home() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteRemedy[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedFavorites = localStorage.getItem('favoriteRemedies');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const clearFavorites = () => {
    localStorage.removeItem('favoriteRemedies');
    setFavorites([]);
  };

  const navigateToRemedy = (remedyId: string) => {
    router.push(`/remedy/${remedyId}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="z-10 max-w-5xl w-full flex justify-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-center bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
          RemediFind
        </h1>
      </div>

      <div className="mb-32 w-full max-w-4xl">
        <div className="rounded-lg p-6 bg-white dark:bg-gray-800 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Find Natural Alternatives</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Enter a pharmaceutical or supplement name to discover natural alternatives that may offer similar benefits.
          </p>
          <SearchComponent />
        </div>

        {mounted && favorites.length > 0 && (
          <div className="rounded-lg p-6 bg-white dark:bg-gray-800 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold flex items-center">
                <Heart className="h-5 w-5 text-red-500 mr-2" />
                Your Favorites
              </h2>
              <button 
                onClick={clearFavorites}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {favorites.map((favorite) => (
                <div 
                  key={favorite.id}
                  className="p-4 border rounded-lg hover:border-primary hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => navigateToRemedy(favorite.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{favorite.name}</h3>
                    <ExternalLink className="h-4 w-4 text-primary" />
                  </div>
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded text-xs">
                    {favorite.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
