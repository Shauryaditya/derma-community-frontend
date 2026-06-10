"use client";

import React, { useState, useEffect, useRef } from "react";
import { StrapiItem, CollectionResponse } from "../types";
import { VideoPost, EmptyState } from "./VideoPost";
import { ImmersiveShortSlide } from "./ImmersiveShortSlide";

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
  const [viewMode, setViewMode] = useState<"cards" | "immersive">("cards");
  const observerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // On mobile, default to cards feed (per user request to not go directly into immersive reel feed).
  // Users can still switch to immersive mode manually using the toggle bar.

  // Match the page size used in initial server load
  const pageSize = 5;

  useEffect(() => {
    if (!observerRef.current || !hasMore || isLoading) return;

    // Use container as root in immersive mode for reliable IntersectionObserver on mobile
    const rootElement = viewMode === "immersive" ? containerRef.current : null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreVideos();
        }
      },
      { 
        root: rootElement,
        threshold: 0.1 
      }
    );

    observer.observe(observerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, page, videos.length, viewMode]);

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

  if (viewMode === "immersive") {
    return (
      <div className="space-y-4">
        {/* Toggle bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Immersive Feed</span>
          </div>
          <div className="flex items-center bg-slate-100/80 rounded-lg p-0.5 text-xs font-semibold border border-slate-200/40">
            <button
              onClick={() => setViewMode("cards")}
              className="px-3 py-1.5 rounded-md transition text-slate-500 hover:text-brand-dark cursor-pointer"
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode("immersive")}
              className="px-3 py-1.5 rounded-md transition bg-white text-brand-dark shadow-sm cursor-pointer"
            >
              ✨ Immersive
            </button>
          </div>
        </div>

        {/* Immersive Scroll Snap Feed */}
        <div 
          ref={containerRef}
          className="fixed inset-x-0 bottom-0 top-16 z-20 md:relative md:inset-auto md:top-0 md:h-[680px] md:rounded-2xl md:border md:border-slate-800 bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-none"
        >
          {filteredVideos.map((video) => (
            <div
              key={video.documentId ?? video.id}
              className="relative w-full h-[calc(100vh-64px)] md:h-[680px] snap-start bg-black flex items-center justify-center overflow-hidden"
            >
              <ImmersiveShortSlide video={video} />
            </div>
          ))}

          {/* Loader at the end of snap feed */}
          {hasMore && (
            <div
              ref={observerRef}
              className="w-full h-[calc(100vh-64px)] md:h-[680px] snap-start bg-black flex flex-col items-center justify-center text-slate-400 gap-3"
            >
              <svg
                className="animate-spin h-8 w-8 text-brand-accent"
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
              <span className="text-sm font-semibold tracking-wider">Loading more shorts...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Classic Card Feed
  return (
    <div className="space-y-6">
      {/* Toggle bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Classic Feed</span>
        </div>
        <div className="flex items-center bg-slate-100/80 rounded-lg p-0.5 text-xs font-semibold border border-slate-200/40">
          <button
            onClick={() => setViewMode("cards")}
            className="px-3 py-1.5 rounded-md transition bg-white text-brand-dark shadow-sm cursor-pointer"
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode("immersive")}
            className="px-3 py-1.5 rounded-md transition text-slate-500 hover:text-brand-dark cursor-pointer"
          >
            ✨ Immersive
          </button>
        </div>
      </div>

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
