import React from "react";
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
  const title = field(video, "title", "Untitled video");
  const description = plainText(field(video, "description", ""));
  const videoUrl = field(video, "videoUrl", "");
  const embedUrl = youtubeEmbedUrl(videoUrl);
  const category = field<StrapiItem | null>(video, "category", null);
  const doctor = field<StrapiItem | null>(video, "doctor", null);
  const doctorName = field(doctor, "name", "Derma Doctor");
  const specialization = field(doctor, "specialization", "Dermatologist");
  const categoryName = field(category, "name", "Skin care");

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
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {description}
          </p>
        )}
      </div>

      <div className="bg-brand-dark aspect-video overflow-hidden">
        {embedUrl ? (
          <iframe
            className="h-full w-full"
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
