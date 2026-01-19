'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ExternalLink, Heart, BookOpen, Pill, AlertCircle, Beaker, Calendar, MessageSquare, PenSquare } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';
import { ReviewForm, ReviewsList } from '@/components/remedy';

// Define the Remedy type that we'll use for this page
interface Remedy {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  matchingNutrients: string[];
  similarityScore: number;
  usage: string;
  dosage: string;
  precautions: string;
  scientificInfo: string;
  references: { title: string; url: string }[];
  relatedRemedies: { id: string; name: string }[];
}

export default function RemedyDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { isFavorite, addFavorite, removeFavorite, isLoading: favoritesLoading } = useFavorites();
  const [remedy, setRemedy] = useState<Remedy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [remedyId, setRemedyId] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);

  useEffect(() => {
    params.then(({ id }) => setRemedyId(id));
  }, [params]);

  useEffect(() => {
    const fetchRemedyDetails = async () => {
      if (!remedyId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/remedy/${remedyId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch remedy details');
        }

        const apiResponse = await response.json();

        // Handle standardized API response format
        if (apiResponse.success === false) {
          setError(apiResponse.error?.message || "Failed to load remedy details");
          return;
        }

        const data = apiResponse.data || apiResponse; // Support both old and new format
        setRemedy(data);
      } catch (err) {
        console.error('Error fetching remedy details:', err);
        setError('Unable to load remedy details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (remedyId) {
      fetchRemedyDetails();
    }
  }, [remedyId]);

  const handleBack = () => {
    router.back();
  };

  const toggleFavorite = async () => {
    if (!remedy) return;

    try {
      if (isFavorite(remedy.id)) {
        await removeFavorite(remedy.id);
      } else {
        await addFavorite(remedy.id, remedy.name);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };
  
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="w-full h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400">Error</h2>
          <p className="mt-2 text-red-600 dark:text-red-300">{error}</p>
          <button 
            onClick={handleBack}
            className="mt-4 flex items-center text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to search results
          </button>
        </div>
      </div>
    );
  }

  if (!remedy) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-amber-700 dark:text-amber-400">Remedy Not Found</h2>
          <p className="mt-2 text-amber-600 dark:text-amber-300">
            The remedy you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <button 
            onClick={handleBack}
            className="mt-4 flex items-center text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to search results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <button 
          onClick={handleBack}
          className="flex items-center text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to search results
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:shrink-0 relative w-full h-56 md:h-auto md:w-48">
            {remedy.imageUrl ? (
              <Image
                src={remedy.imageUrl}
                alt={remedy.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400">No Image</span>
              </div>
            )}
          </div>
          <div className="p-6 w-full">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mb-2">
                  {remedy.category}
                </span>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{remedy.name}</h1>
              </div>
              <button
                className={`p-2 rounded-full ${isFavorite(remedy.id) ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'} ${favoritesLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={toggleFavorite}
                disabled={favoritesLoading}
                title={isFavorite(remedy.id) ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={`h-5 w-5 ${isFavorite(remedy.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{remedy.description}</p>
            
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Matching Nutrients:</div>
              <div className="flex flex-wrap gap-1">
                {remedy.matchingNutrients.map((nutrient) => (
                  <span
                    key={nutrient}
                    className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs"
                  >
                    {nutrient}
                  </span>
                ))}
              </div>
            </div>
            
            {remedy.similarityScore !== undefined && (
              <div className="mt-4 flex items-center">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">Match Score:</div>
                <div className="flex items-center">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-24">
                    <div 
                      className="bg-primary rounded-full h-2" 
                      style={{ width: `${remedy.similarityScore * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {(remedy.similarityScore * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {/* Usage Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <BookOpen className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Usage</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{remedy.usage}</p>
            </div>
          </div>

          {/* Dosage Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Pill className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dosage</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{remedy.dosage}</p>
            </div>
          </div>

          {/* Precautions Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Precautions</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{remedy.precautions}</p>
            </div>
          </div>

          {/* Scientific Information Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('scientific')}
              >
                <div className="flex items-center">
                  <Beaker className="h-5 w-5 text-primary mr-2" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Scientific Information</h2>
                </div>
                <svg className={`w-5 h-5 transition-transform ${expandedSection === 'scientific' ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div className={`mt-4 ${expandedSection === 'scientific' ? 'block' : 'hidden'}`}>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{remedy.scientificInfo}</p>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Scientific Studies & References</h3>
                  <ul className="space-y-2">
                    {remedy.references.map((reference, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 h-5 w-5 text-primary mr-2">
                          <ExternalLink className="h-4 w-4" />
                        </div>
                        <a
                          href={reference.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          {reference.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Disclaimer */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-amber-800 dark:text-amber-300">Medical Disclaimer</h3>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
              This information is for educational purposes only and is not intended as a substitute for medical advice.
              Always consult a qualified healthcare provider before using any natural remedy or making changes to your treatment plan.
            </p>
          </div>

          {/* Reviews Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-primary mr-2" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reviews</h2>
                </div>
                {!showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <PenSquare className="w-4 h-4" />
                    Write a Review
                  </button>
                )}
              </div>

              {showReviewForm && remedyId && (
                <div className="mb-6">
                  <ReviewForm
                    remedyId={remedyId}
                    remedyName={remedy.name}
                    onReviewSubmitted={() => {
                      setShowReviewForm(false);
                      setReviewRefreshTrigger(prev => prev + 1);
                    }}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </div>
              )}

              {remedyId && (
                <ReviewsList
                  remedyId={remedyId}
                  refreshTrigger={reviewRefreshTrigger}
                />
              )}
            </div>
          </div>
        </div>

        <div>
          {/* Related Remedies Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden sticky top-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Calendar className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Related Remedies</h2>
              </div>
              <div className="space-y-3">
                {remedy.relatedRemedies.map((related) => (
                  <div 
                    key={related.id}
                    onClick={() => router.push(`/remedy/${related.id}`)}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary dark:hover:border-primary cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">{related.name}</span>
                      <ExternalLink className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
