import React, { useState } from "react";
import { StrapiItem } from "../types";
import { field, plainText, initials, youtubeEmbedUrl, formatDate } from "../utils/strapi";

export function ImmersiveShortSlide({ video }: { video: StrapiItem }) {
  const [copied, setCopied] = useState(false);
  const title = field(video, "title", "Untitled video");
  const description = plainText(field(video, "description", ""));
  const videoUrl = field(video, "videoUrl", "");
  const embedUrl = youtubeEmbedUrl(videoUrl);
  const category = field<StrapiItem | null>(video, "category", null);
  const doctor = field<StrapiItem | null>(video, "doctor", null);
  const doctorName = field(doctor, "name", "Derma Doctor");
  const specialization = field(doctor, "specialization", "Dermatologist");
  const categoryName = field(category, "name", "Skin care");

  const handleShare = () => {
    navigator.clipboard.writeText(videoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full max-w-[450px] aspect-[9/16] relative flex items-center justify-center bg-brand-dark shadow-2xl">
      {/* Video Iframe */}
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

      {/* Dark Overlay gradient (only visible at the bottom to ensure text readability) */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none z-10" />

      {/* Action Buttons Overlay (Right Side) */}
      <div className="absolute right-3 bottom-24 flex flex-col gap-5 z-20 items-center">
        {/* Watch on YouTube */}
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 group pointer-events-auto cursor-pointer"
          title="Watch on YouTube"
        >
          <div className="flex size-11 items-center justify-center rounded-full bg-black/40 hover:bg-red-600 border border-white/10 hover:border-red-500 transition-all duration-300 shadow-md backdrop-blur-md">
            <svg className="size-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11C4.483 20.455 12 20.455 12 20.455s7.517 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <span className="text-[10px] text-slate-300 font-bold tracking-wider uppercase group-hover:text-white transition drop-shadow-sm">
            Watch
          </span>
        </a>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 group pointer-events-auto cursor-pointer"
          title="Copy Link"
        >
          <div className={`flex size-11 items-center justify-center rounded-full transition-all duration-300 shadow-md backdrop-blur-md border ${
            copied 
              ? "bg-brand-accent text-brand-dark border-brand-accent" 
              : "bg-black/40 text-white border-white/10 hover:bg-brand-primary hover:border-brand-primary"
          }`}>
            {copied ? (
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935-2.186 2.25 2.25 0 00-3.935 2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            )}
          </div>
          <span className="text-[10px] text-slate-300 font-bold tracking-wider uppercase group-hover:text-white transition drop-shadow-sm">
            {copied ? "Copied!" : "Share"}
          </span>
        </button>
      </div>

      {/* Info Details Overlay (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 text-white z-20 flex flex-col gap-2 pointer-events-none">
        {/* Doctor Info */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-accent text-xs font-bold text-brand-dark shadow-sm">
            {initials(doctorName)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold tracking-tight text-white">{doctorName}</p>
              <span className="inline-flex items-center rounded bg-emerald-500/25 px-1 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium truncate">{specialization}</p>
          </div>
        </div>

        {/* Video Title */}
        <h4 className="text-sm font-bold tracking-tight text-white leading-snug line-clamp-2 pointer-events-auto mt-1 drop-shadow-sm">
          {title}
        </h4>

        {/* Video Description (Scrollable box) */}
        {description && (
          <div className="pointer-events-auto bg-black/30 backdrop-blur-sm p-2 rounded-lg border border-white/5 max-h-[72px] overflow-y-auto mt-0.5 text-[11px] leading-relaxed text-slate-300">
            {description}
          </div>
        )}

        {/* Category & Date Footer */}
        <div className="flex items-center gap-2 pointer-events-auto mt-1">
          <span className="rounded bg-brand-primary/80 border border-brand-primary-light/50 px-2 py-0.5 text-[9px] font-bold text-brand-secondary">
            {categoryName}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            Published {formatDate(field(video, "publishedAt", ""))}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ImmersiveShortSlide;
