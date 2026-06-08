type StrapiItem = {
  id: number;
  documentId?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
};

type CollectionResponse = {
  data?: StrapiItem[];
};

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

const endpoints = {
  categories: "/api/categories",
  videos: "/api/videos?populate=*",
  doctors: "/api/doctors?populate=*",
};

async function getCollection(path: string) {
  try {
    const response = await fetch(`${STRAPI_URL}${path}`, {
      next: { revalidate: 15 },
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as CollectionResponse;
    return payload.data ?? [];
  } catch {
    return [];
  }
}

function field<T>(item: StrapiItem | undefined | null, key: string, fallback: T): T {
  if (!item) {
    return fallback;
  }

  const value = item.attributes?.[key] ?? item[key];
  return (value ?? fallback) as T;
}

function plainText(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((block) => {
        if (!block || typeof block !== "object" || !("children" in block)) {
          return "";
        }

        const children = (block as { children?: Array<{ text?: string }> }).children;
        return children?.map((child) => child.text ?? "").join("") ?? "";
      })
      .filter(Boolean)
      .join(" ");
  }

  return "";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function youtubeEmbedUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${parsedUrl.pathname.replace("/", "")}`;
    }

    if (parsedUrl.pathname.startsWith("/shorts/")) {
      return `https://www.youtube.com/embed/${parsedUrl.pathname.split("/")[2]}`;
    }

    const watchId = parsedUrl.searchParams.get("v");
    if (watchId) {
      return `https://www.youtube.com/embed/${watchId}`;
    }
  } catch {
    return "";
  }

  return "";
}

function formatDate(value: unknown) {
  if (typeof value !== "string") {
    return "Today";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
      {label}
    </div>
  );
}

function VideoPost({ video }: { video: StrapiItem }) {
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

export default async function Home() {
  const [categories, videos, doctors] = await Promise.all([
    getCollection(endpoints.categories),
    getCollection(endpoints.videos),
    getCollection(endpoints.doctors),
  ]);

  const featuredVideo = videos[0];
  const feedVideos = videos.slice(0, 8);

  return (
    <main className="min-h-screen bg-brand-light text-brand-dark font-sans">
      <header className="sticky top-0 z-10 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-primary text-base font-bold text-white shadow-sm ring-1 ring-brand-primary/10">
              D
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">Derma Community</p>
              <p className="text-xs text-slate-500 font-medium">Verified Dermatologist Videos</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a className="text-brand-primary hover:text-brand-primary-light transition" href="#feed">
              Feed
            </a>
            <a className="hover:text-brand-primary transition" href="#categories">Categories</a>
            <a className="hover:text-brand-primary transition" href="#doctors">Doctors</a>
          </nav>
          {/* CMS Button removed as requested */}
          <div className="w-10 md:w-0"></div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)_300px] lg:px-8">
        {/* Left Sidebar */}
        <aside id="categories" className="hidden space-y-6 lg:block">
          <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold tracking-wider text-slate-400 uppercase">Browse topics</h2>
            <div className="mt-4 space-y-1">
              {categories.length === 0 ? (
                <EmptyState label="Add categories in Strapi." />
              ) : (
                categories.map((category) => (
                  <a
                    key={category.documentId ?? category.id}
                    href="#feed"
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-brand-secondary/40 hover:text-brand-primary"
                  >
                    <span>{field(category, "name", "Category")}</span>
                    <span className="text-[10px] text-brand-accent bg-brand-secondary px-2 py-0.5 rounded-full font-bold">#</span>
                  </a>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl bg-brand-primary p-5 text-white shadow-sm border border-brand-primary/10">
            <p className="text-sm font-bold tracking-wide text-brand-accent">DERMA CARE LIBRARY</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">
              Explore verified, educational skin content created directly by professional dermatologists. Learn about skincare, diagnoses, and treatments.
            </p>
          </div>
        </aside>

        {/* Center Feed */}
        <section id="feed" className="min-w-0 space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold tracking-widest text-brand-accent uppercase">Educational Library</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl text-brand-dark">
                  Dermatologist-Led Skin Education
                </h1>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center sm:w-auto">
                <div className="rounded-lg bg-brand-secondary/30 px-3 py-2 border border-brand-secondary">
                  <p className="text-lg font-bold text-brand-primary">{videos.length}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Videos</p>
                </div>
                <div className="rounded-lg bg-brand-secondary/30 px-3 py-2 border border-brand-secondary">
                  <p className="text-lg font-bold text-brand-primary">{categories.length}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Topics</p>
                </div>
                <div className="rounded-lg bg-brand-secondary/30 px-3 py-2 border border-brand-secondary">
                  <p className="text-lg font-bold text-brand-primary">{doctors.length}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Doctors</p>
                </div>
              </div>
            </div>
          </div>

          {featuredVideo && (
            <div className="rounded-2xl border border-brand-accent/40 bg-brand-accent/5 p-4 shadow-sm">
              <p className="px-1 pb-3 text-xs font-bold tracking-widest text-brand-accent uppercase">Featured Explainer</p>
              <VideoPost video={featuredVideo} />
            </div>
          )}

          {feedVideos.length === 0 ? (
            <EmptyState label="Publish a video in Strapi to see the library feed." />
          ) : (
            <div className="space-y-6">
              {feedVideos.slice(featuredVideo ? 1 : 0).map((video) => (
                <VideoPost key={video.documentId ?? video.id} video={video} />
              ))}
            </div>
          )}
        </section>

        {/* Right Sidebar */}
        <aside id="doctors" className="space-y-6">
          <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold tracking-wider text-slate-400 uppercase">Verified Doctors</h2>
            <div className="mt-4 space-y-3">
              {doctors.length === 0 ? (
                <EmptyState label="Add doctors in Strapi to show profiles here." />
              ) : (
                doctors.slice(0, 5).map((doctor) => {
                  const name = field(doctor, "name", "Doctor");

                  return (
                    <div key={doctor.documentId ?? doctor.id} className="flex items-center gap-3 p-1 transition hover:bg-brand-secondary/20 rounded-lg">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-secondary text-xs font-bold text-brand-primary">
                        {initials(name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-brand-dark">{name}</p>
                        <p className="truncate text-xs text-slate-500">
                          {field(doctor, "specialization", "Dermatologist")}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

