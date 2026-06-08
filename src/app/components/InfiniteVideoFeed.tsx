"use client";

import React, { useState, useEffect, useRef } from "react";
import { StrapiItem, CollectionResponse } from "../types";
import { VideoPost, EmptyState } from "./VideoPost";

interface InfiniteVideoFeedProps {
  initialVideos: StrapiItem[];
  totalCount: number;
  strapiUrl: string;
  featuredVideoId?: number | string;
}

export function InfiniteVideoFeed({
  initialVideos,
  totalCount,
  strapiUrl,
  featuredVideoId,
}: InfiniteVideoFeedProps) {
  const [videos, setVideos] = useState<StrapiItem[]>(initialVideos);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialVideos.length < totalCount);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Match the page size used in initial server load
  const pageSize = 5;

  useEffect(() => {
    if (!observerRef.current || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreVideos();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, page, videos.length]);

  const loadMoreVideos = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const nextPage = page + 1;

    try {
      const url = `${strapiUrl}/api/videos?populate=*&pagination[page]=${nextPage}&pagination[pageSize]=${pageSize}`;
      const response = await fetch(url);

      if (response.ok) {
        const payload = (await response.json()) as CollectionResponse;
        const newVideos = payload.data ?? [];

        if (newVideos.length > 0) {
          setVideos((prev) => {
            const existingIds = new Set(prev.map((v) => v.documentId ?? v.id));
            const filteredNew = newVideos.filter((v) => !existingIds.has(v.documentId ?? v.id));
            return [...prev, ...filteredNew];
          });

          setPage(nextPage);

          const updatedTotal = payload.meta?.pagination?.total ?? totalCount;
          // Calculate total items loaded so far
          const nextCount = videos.length + newVideos.length;
          setHasMore(nextCount < updatedTotal);
        } else {
          setHasMore(false);
        }
      } else {
        console.error("Failed to fetch more videos from Strapi API");
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching more videos:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out the featured video from the feed to prevent duplicate rendering
  const filteredVideos = featuredVideoId
    ? videos.filter((video) => (video.documentId ?? video.id) !== featuredVideoId)
    : videos;

  if (videos.length === 0) {
    return <EmptyState label="Publish a video in Strapi to see the library feed." />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {filteredVideos.map((video) => (
          <VideoPost key={video.documentId ?? video.id} video={video} />
        ))}
      </div>

      {hasMore && (
        <div
          ref={observerRef}
          className="flex justify-center py-6"
          id="scroll-trigger"
        >
          <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
            <svg
              className="animate-spin h-5 w-5 text-brand-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading more videos...</span>
          </div>
        </div>
      )}
    </div>
  );
}
export default InfiniteVideoFeed;
