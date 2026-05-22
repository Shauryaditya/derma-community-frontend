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
    <article className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-[#e7f0ec] text-sm font-semibold text-teal-900">
          {initials(doctorName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-slate-950">{doctorName}</h2>
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              Verified
            </span>
          </div>
          <p className="truncate text-xs text-slate-500">
            {specialization} · {formatDate(field(video, "publishedAt", ""))}
          </p>
        </div>
        <span className="rounded-md bg-[#fff3d6] px-2.5 py-1 text-xs font-medium text-[#7b4b00]">
          {categoryName}
        </span>
      </div>

      <div className="px-4 pb-4 sm:px-5">
        <h3 className="text-xl font-semibold tracking-normal text-slate-950">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {description ||
            "Doctor-led explainer video. Add a short caption in Strapi to make this post feel more conversational."}
        </p>
      </div>

      <div className="bg-slate-950">
        {embedUrl ? (
          <iframe
            className="aspect-video w-full"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="flex aspect-video items-center justify-center px-6 text-center text-sm text-white">
            Add a YouTube URL to this video post.
          </div>
        )}
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm">
          <div className="flex gap-4 font-medium text-slate-700">
            <button className="hover:text-teal-700">Like</button>
            <button className="hover:text-teal-700">Comment</button>
            <button className="hover:text-teal-700">Share</button>
          </div>
          <span className="text-slate-500">24 comments</span>
        </div>

        <div className="rounded-lg bg-slate-50 px-3 py-3">
          <p className="text-sm font-medium text-slate-900">Top question</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Can this advice apply to sensitive skin too?
          </p>
        </div>

        <div className="flex gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#ffe1d8] text-xs font-semibold text-[#7d2716]">
            U
          </div>
          <div className="flex min-h-10 flex-1 items-center rounded-lg border border-slate-200 px-3 text-sm text-slate-400">
            Write a comment or ask a follow-up...
          </div>
        </div>
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
    <main className="min-h-screen bg-[#f7f5ef] text-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-teal-700 text-base font-semibold text-white">
              D
            </div>
            <div>
              <p className="text-sm font-semibold">Derma Community</p>
              <p className="text-xs text-slate-500">Doctor-led skin education</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a className="text-slate-950" href="#feed">
              Feed
            </a>
            <a href="#categories">Categories</a>
            <a href="#doctors">Doctors</a>
          </nav>
          <a
            href={`${STRAPI_URL}/admin`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            CMS
          </a>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)_300px] lg:px-8">
        <aside id="categories" className="hidden space-y-4 lg:block">
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-sm font-semibold text-slate-950">Browse topics</h2>
            <div className="mt-4 space-y-2">
              {categories.length === 0 ? (
                <EmptyState label="Add categories in Strapi." />
              ) : (
                categories.map((category) => (
                  <a
                    key={category.documentId ?? category.id}
                    href="#feed"
                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition hover:bg-slate-50"
                  >
                    <span className="font-medium">{field(category, "name", "Category")}</span>
                    <span className="text-xs text-slate-400">#</span>
                  </a>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg bg-[#102a2a] p-4 text-white">
            <p className="text-sm font-semibold">MVP shape</p>
            <p className="mt-2 text-sm leading-6 text-teal-50">
              Doctors publish video/image posts. Users react, comment, and ask follow-up questions.
            </p>
          </div>
        </aside>

        <section id="feed" className="min-w-0 space-y-5">
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-teal-700">Home feed</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-normal sm:text-3xl">
                  Skin advice, posted like social content
                </h1>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-slate-50 px-3 py-2">
                  <p className="text-lg font-semibold">{videos.length}</p>
                  <p className="text-xs text-slate-500">Videos</p>
                </div>
                <div className="rounded-md bg-slate-50 px-3 py-2">
                  <p className="text-lg font-semibold">{categories.length}</p>
                  <p className="text-xs text-slate-500">Topics</p>
                </div>
                <div className="rounded-md bg-slate-50 px-3 py-2">
                  <p className="text-lg font-semibold">{doctors.length}</p>
                  <p className="text-xs text-slate-500">Doctors</p>
                </div>
              </div>
            </div>
          </div>

          {featuredVideo && (
            <div className="rounded-lg border border-teal-200 bg-[#eaf5f0] p-3">
              <p className="px-2 pb-3 text-sm font-semibold text-teal-900">Featured post</p>
              <VideoPost video={featuredVideo} />
            </div>
          )}

          {feedVideos.length === 0 ? (
            <EmptyState label="Publish a video in Strapi to see the social feed." />
          ) : (
            feedVideos.slice(featuredVideo ? 1 : 0).map((video) => (
              <VideoPost key={video.documentId ?? video.id} video={video} />
            ))
          )}
        </section>

        <aside id="doctors" className="space-y-4">
          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-sm font-semibold text-slate-950">Post composer preview</h2>
            <div className="mt-4 rounded-lg border border-slate-200 p-3">
              <p className="text-sm text-slate-500">Doctor can post</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium">YouTube</span>
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium">Image</span>
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium">Text</span>
              </div>
            </div>
            <button className="mt-4 h-10 w-full rounded-md bg-teal-700 text-sm font-medium text-white">
              New post
            </button>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-sm font-semibold text-slate-950">Verified doctors</h2>
            <div className="mt-4 space-y-3">
              {doctors.length === 0 ? (
                <EmptyState label="Add doctors in Strapi to show profiles here." />
              ) : (
                doctors.slice(0, 5).map((doctor) => {
                  const name = field(doctor, "name", "Doctor");

                  return (
                    <div key={doctor.documentId ?? doctor.id} className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#ffe1d8] text-xs font-semibold text-[#7d2716]">
                        {initials(name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{name}</p>
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

          <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-sm font-semibold text-slate-950">Management demo story</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This is a dermatologist-led social feed. YouTube embeds are posts, images can be posts,
              and comments become patient questions.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
