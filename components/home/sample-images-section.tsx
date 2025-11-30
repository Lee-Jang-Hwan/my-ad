"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  fetchPublicImages,
  type PublicImage,
} from "@/actions/image/fetch-public-images";

interface SampleImage {
  id: string;
  title: string;
  imageUrl: string;
  adCopy?: string;
}

export function SampleImagesSection() {
  const [displayImages, setDisplayImages] = useState<SampleImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch public images on mount
    async function loadPublicImages() {
      try {
        const result = await fetchPublicImages(8);

        if (result.success && result.images.length > 0) {
          // Convert public images to SampleImage format
          const publicImages: SampleImage[] = result.images.map(
            (image: PublicImage) => ({
              id: image.id,
              title: image.product_name || "광고이미지",
              imageUrl: image.image_url,
              adCopy: image.selected_ad_copy || undefined,
            })
          );

          setDisplayImages(publicImages);
        }
      } catch (error) {
        console.error("Failed to load public images:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPublicImages();
  }, []);

  // Don't render anything if loading or no images
  if (isLoading) {
    return (
      <div
        id="sample-images-section"
        className="max-w-7xl mx-auto px-4 md:px-8"
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (displayImages.length === 0) {
    return null;
  }

  return (
    <div id="sample-images-section" className="max-w-7xl mx-auto px-4 md:px-8">
      {/* Images Grid - 1:1 ratio square images */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {displayImages.map((image) => (
          <div
            key={image.id}
            className="relative overflow-hidden rounded-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
          >
            <div className="aspect-square relative bg-muted">
              <Image
                src={image.imageUrl}
                alt={image.title}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Overlay with ad copy on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
              <div className="text-white">
                <p className="font-medium text-sm line-clamp-2">{image.title}</p>
                {image.adCopy && (
                  <p className="text-xs text-white/80 mt-1 line-clamp-2">
                    {image.adCopy}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
