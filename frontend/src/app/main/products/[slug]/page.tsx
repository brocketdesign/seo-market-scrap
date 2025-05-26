'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OldProductRedirect({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { slug } = params;
  
  useEffect(() => {
    // Redirect to the new product URL structure
    router.replace(`/products/${slug}`);
  }, [router, slug]);
  
  // Show a loading message while redirecting
  return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-600 border-blue-200 mb-4"></div>
        <p className="text-gray-600">Redirecting to the new product page...</p>
      </div>
    </div>
  );
}
