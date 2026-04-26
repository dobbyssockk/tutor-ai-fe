import { useEffect, useState } from 'react';

import type { MediaGalleryExplorerSpec } from '@/shared/components/interactive/interactive-spec';
import {
  GALLERY_LIMIT_OPTIONS,
  WikimediaMediaItem,
  buildMediaSearchCandidates,
  getSubjectLabel,
  normalizeGalleryLimitOption,
  parseWikimediaMedia,
} from './shared-utils';

const MediaGalleryExplorer = ({ spec }: { spec: MediaGalleryExplorerSpec }) => {
  const [queryInput, setQueryInput] = useState(spec.query);
  const [query, setQuery] = useState(spec.query);
  const [mediaType, setMediaType] = useState<'image' | 'video'>(spec.mediaType);
  const [limit, setLimit] = useState(normalizeGalleryLimitOption(spec.limit));
  const [items, setItems] = useState<WikimediaMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQueryInput(spec.query);
    setQuery(spec.query);
    setMediaType(spec.mediaType);
    setLimit(normalizeGalleryLimitOption(spec.limit));
  }, [spec.limit, spec.mediaType, spec.query]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const normalized = queryInput.trim();
      if (!normalized) return;
      setQuery(normalized);
    }, 260);

    return () => window.clearTimeout(timeoutId);
  }, [queryInput]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      setItems([]);
      setError('Введите поисковый запрос.');
      return;
    }

    const controller = new AbortController();
    const candidates = buildMediaSearchCandidates(normalizedQuery, spec.subject);

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        for (const candidate of candidates) {
          const params = new URLSearchParams({
            action: 'query',
            format: 'json',
            origin: '*',
            generator: 'search',
            gsrnamespace: '6',
            gsrlimit: String(Math.max(3, Math.min(12, Math.round(limit)))),
            gsrsearch:
              mediaType === 'video'
                ? `${candidate} filetype:video`
                : candidate,
            prop: 'imageinfo',
            iiprop: 'url|mime|extmetadata',
            iiurlwidth: '1200',
          });

          const response = await fetch(
            `https://commons.wikimedia.org/w/api.php?${params.toString()}`,
            { signal: controller.signal }
          );
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const json = (await response.json()) as unknown;
          const parsed = parseWikimediaMedia(json).slice(0, limit);
          if (parsed.length) {
            setItems(parsed);
            return;
          }
        }

        setItems([]);
        setError('По этому запросу пока ничего не найдено.');
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        setItems([]);
        setError('Не удалось загрузить медиа из Wikimedia Commons.');
        console.error(fetchError);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => controller.abort();
  }, [limit, mediaType, query, spec.subject]);

  const subjectLabel = getSubjectLabel(spec.subject);

  return (
    <div className="space-y-4 rounded-xl border bg-background px-4 py-4">
      <div className="space-y-1 text-center">
        <h3 className="text-base font-semibold">{spec.title}</h3>
        {subjectLabel ? (
          <p className="text-xs text-muted-foreground">{subjectLabel}</p>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Поисковый запрос</span>
          <input
            type="text"
            value={queryInput}
            onChange={(event) => setQueryInput(event.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            placeholder="например, animal cell"
          />
        </label>
        <label className="flex flex-col gap-1 md:justify-self-end">
          <span className="text-xs text-muted-foreground">Тип</span>
          <select
            value={mediaType}
            onChange={(event) => setMediaType(event.target.value as 'image' | 'video')}
            className="h-9 w-full min-w-[170px] rounded-md border bg-background px-2 text-sm"
          >
            <option value="image">Фото</option>
            <option value="video">Видео</option>
          </select>
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Количество</p>
        <div className="flex flex-wrap gap-2">
          {GALLERY_LIMIT_OPTIONS.map((option) => {
            const isActive = option === limit;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setLimit(option)}
                className={`rounded-md border px-3 py-1.5 text-xs transition ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-500/15 text-indigo-200'
                    : 'border-border bg-background text-muted-foreground hover:border-indigo-300'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Загрузка медиа...</p>
      ) : null}
      {!isLoading && error ? (
        <p className="text-sm text-muted-foreground">{error}</p>
      ) : null}

      {!isLoading && items.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const isVideo =
              mediaType === 'video' ||
              (item.mime ? item.mime.toLowerCase().startsWith('video/') : false);
            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-lg border bg-muted/20"
              >
                {isVideo ? (
                  <video
                    src={item.url}
                    controls
                    className="h-40 w-full bg-black object-cover"
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.title}
                    loading="lazy"
                    className="h-40 w-full object-cover"
                  />
                )}
                <div className="space-y-1 px-3 py-2">
                  <p className="line-clamp-2 text-sm font-medium">{item.title}</p>
                  {item.license ? (
                    <p className="text-[11px] text-muted-foreground">
                      Лицензия: {item.license}
                    </p>
                  ) : null}
                  <a
                    href={item.pageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-700 underline-offset-2 hover:underline"
                  >
                    Открыть источник
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default MediaGalleryExplorer;
