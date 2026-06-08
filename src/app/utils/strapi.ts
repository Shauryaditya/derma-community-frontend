import { StrapiItem } from "../types";

export function field<T>(item: StrapiItem | undefined | null, key: string, fallback: T): T {
  if (!item) {
    return fallback;
  }

  const value = item.attributes?.[key] ?? item[key];
  return (value ?? fallback) as T;
}

export function plainText(value: unknown): string {
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

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function youtubeEmbedUrl(url: string): string {
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

export function formatDate(value: unknown): string {
  if (typeof value !== "string") {
    return "Today";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
