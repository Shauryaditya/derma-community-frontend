"use client";

import React, { useState } from "react";
import { StrapiItem } from "../types";
import { field, plainText, initials, youtubeEmbedUrl, formatDate } from "../utils/strapi";

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
      {label}
    </div>
  );
}

export function VideoPost({ video }: { video: StrapiItem }) {
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const title = field(video, "title", "Untitled video");
  const description = plainText(field(video, "description", ""));
  const videoUrl = field(video, "videoUrl", "");
  const embedUrl = youtubeEmbedUrl(videoUrl);
  const category = field<StrapiItem | null>(video, "category", null);
  const doctor = field<StrapiItem | null>(video, "doctor", null);
  const doctorName = field(doctor, "name", "Derma Doctor");
  const specialization = field(doctor, "specialization", "Dermatologist");
  const categoryName = field(category, "name", "Skin care");

  const isShort = videoUrl.includes("/shorts/");
  const shouldTruncate = description.length > 180;
  const displayDescription = shouldTruncate && !isDescExpanded
    ? `${description.slice(0, 180)}...`
    : description;

  if (isShort) {
    return (
      <article className="overflow-hidden rounded-xl bg-white border border-slate-100 shadow-sm transition duration-300 hover:shadow-md grid grid-cols-1 md:grid-cols-[270px_1fr] md:grid-rows-[1fr_auto] md:h-[480px]">
        {/* Content Column (Header & Text) */}
        <div className="p-5 md:p-6 md:pb-3 md:col-start-2 md:row-start-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-secondary text-sm font-semibold text-brand-primary">
                {initials(doctorName)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h2 className="truncate text-sm font-semibold text-brand-dark">{doctorName}</h2>
                  <span className="inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-600/10 shrink-0">
                    Verified
                  </span>
                </div>
                <p className="truncate text-xs text-slate-500">
                  {specialization}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-brand-accent/10 px-2.5 py-0.5 text-xs font-semibold text-brand-accent border border-brand-accent/20 shrink-0">
              {categoryName}
            </span>
          </div>

          <h3 className="text-lg md:text-xl font-bold tracking-tight text-brand-dark line-clamp-2 md:line-clamp-3">
            {title}
          </h3>
          {description && (
            <div className="mt-3 text-sm leading-relaxed text-slate-600">
              <span className="whitespace-pre-line">{displayDescription}</span>
              {shouldTruncate && (
                <button
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="text-brand-primary hover:text-brand-primary-light font-semibold ml-1 cursor-pointer focus:outline-none inline-block"
                >
                  {isDescExpanded ? "Read less" : "Read more"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Video Column */}
        <div className="bg-black shrink-0 relative flex items-center justify-center w-full md:w-[270px] h-[500px] sm:h-[540px] md:h-full aspect-[9/16] overflow-hidden md:col-start-1 md:row-start-1 md:row-span-2">
          {embedUrl ? (
            <iframe
              className="h-full w-full absolute inset-0 border-0"
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-400">
              No YouTube URL provided.
            </div>
          )}
        </div>

        {/* Footer Column */}
        <div className="px-5 pb-5 pt-4 border-t border-slate-100/60 md:p-6 md:pt-3 md:border-t md:border-slate-100/60 md:col-start-2 md:row-start-2 flex items-center justify-between text-xs text-slate-500">
          <span>Published {formatDate(field(video, "publishedAt", ""))}</span>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-brand-primary hover:text-brand-primary-light font-semibold transition"
          >
            Watch on YouTube
            <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        </div>
      </article>
    );
  }

  // Standard Video Layout (16:9)
  return (
    <article className="overflow-hidden rounded-xl bg-white border border-slate-100 shadow-sm transition duration-300 hover:shadow-md">
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-secondary text-sm font-semibold text-brand-primary">
          {initials(doctorName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-brand-dark">{doctorName}</h2>
            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/10">
              Verified
            </span>
          </div>
          <p className="truncate text-xs text-slate-500">
            {specialization} • {formatDate(field(video, "publishedAt", ""))}
          </p>
        </div>
        <span className="rounded-full bg-brand-accent/10 px-3 py-1 text-xs font-semibold text-brand-accent border border-brand-accent/20">
          {categoryName}
        </span>
      </div>

      <div className="px-5 pb-4">
        <h3 className="text-xl font-bold tracking-tight text-brand-dark">{title}</h3>
        {description && (
          <div className="mt-2 text-sm leading-relaxed text-slate-600">
            <span className="whitespace-pre-line">{displayDescription}</span>
            {shouldTruncate && (
              <button
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="text-brand-primary hover:text-brand-primary-light font-semibold ml-1 cursor-pointer focus:outline-none inline-block"
              >
                {isDescExpanded ? "Read less" : "Read more"}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-brand-dark aspect-video overflow-hidden">
        {embedUrl ? (
          <iframe
            className="h-full w-full border-0"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-400">
            No YouTube URL provided for this post.
          </div>
        )}
      </div>
    </article>
  );
}
