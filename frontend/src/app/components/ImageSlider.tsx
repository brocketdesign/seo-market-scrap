'use client';

import { useState } from 'react';

interface ImageSliderProps {
  images: string[];
  productName: string;
}

export default function ImageSlider({ images, productName }: ImageSliderProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Handle when there are no images
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg shadow-md flex items-center justify-center">
        <img 
          src="/placeholder-product.svg" 
          alt="No product images available"
          className="w-full h-full object-contain p-4"
        />
      </div>
    );
  }

  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };

  const goToPrevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Main image - clickable to open modal */}
      <div 
        className="w-full h-96 bg-gray-100 rounded-lg shadow-md overflow-hidden cursor-pointer relative"
        onClick={openModal}
      >
        <img 
          src={images[currentImageIndex]} 
          alt={`${productName} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-product.svg';
          }}
        />
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <div 
              key={index} 
              className={`
                w-full h-24 rounded-md overflow-hidden cursor-pointer border-2 
                ${index === currentImageIndex ? 'border-indigo-600' : 'border-transparent'}
              `}
              onClick={() => goToImage(index)}
            >
              <img 
                src={image} 
                alt={`${productName} - Thumbnail ${index + 1}`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-product.png';
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal for fullscreen view */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4">
          {/* Close button */}
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
            onClick={closeModal}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Image counter */}
          <div className="text-white text-sm mb-2">
            Image {currentImageIndex + 1} of {images.length}
          </div>
          
          {/* Main image */}
          <div className="relative w-full h-full max-w-4xl max-h-[80vh] flex items-center justify-center">
            <img 
              src={images[currentImageIndex]} 
              alt={`${productName} - Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-product.png';
              }}
            />
            
            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <button 
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-r-md hover:bg-opacity-75 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevImage();
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-l-md hover:bg-opacity-75 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextImage();
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnails in modal */}
          {images.length > 1 && (
            <div className="flex space-x-2 mt-4 overflow-x-auto max-w-full p-2">
              {images.map((image, index) => (
                <div 
                  key={index} 
                  className={`
                    w-16 h-16 rounded-md overflow-hidden cursor-pointer flex-shrink-0 border-2
                    ${index === currentImageIndex ? 'border-white' : 'border-transparent'}
                  `}
                  onClick={() => goToImage(index)}
                >
                  <img 
                    src={image} 
                    alt={`${productName} - Thumbnail ${index + 1}`}
                    className="w-full h-full object-contain bg-gray-800"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-product.png';
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
