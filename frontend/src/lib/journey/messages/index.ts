import type { JourneyMessageConfig } from './types';

type MessageModule = { default?: JourneyMessageConfig | string };

const FALLBACK_MESSAGE: JourneyMessageConfig = {
  heading: 'Stage Complete',
  message: 'Fantastic work advancing your skills.',
  ctaLabel: 'CONTINUE YOUR JOURNEY',
};

const loaders = import.meta.glob<MessageModule>('./*.ts');

function normalizeName(path: string): string {
  return path.replace(/^\.\//, '').replace(/\.ts$/, '').toLowerCase();
}

async function loadByKey(key: string): Promise<JourneyMessageConfig | null> {
  const normalizedKey = key.toLowerCase();

  for (const [path, loader] of Object.entries(loaders)) {
    const name = normalizeName(path);
    if (name === 'index' || name === 'types') {
      continue;
    }

    if (name === normalizedKey) {
      try {
        const mod = await loader();
        const payload = mod.default;
        if (!payload) {
          return null;
        }
        if (typeof payload === 'string') {
          return {
            ...FALLBACK_MESSAGE,
            message: payload,
          } satisfies JourneyMessageConfig;
        }
        if (typeof payload.message === 'string' && payload.message.trim().length > 0) {
          return {
            heading: payload.heading ?? FALLBACK_MESSAGE.heading,
            message: payload.message,
            ctaLabel: payload.ctaLabel ?? FALLBACK_MESSAGE.ctaLabel,
          } satisfies JourneyMessageConfig;
        }
      } catch (error) {
        console.warn('Failed to load journey message module', { key, error });
        return null;
      }
    }
  }

  return null;
}

function buildCandidateKeys(pathSlug: string, fromStage: string, toStage: string | null): string[] {
  const normalizedSlug = pathSlug.toLowerCase();
  const normalizedFrom = fromStage.toLowerCase();
  const normalizedTo = (toStage ?? 'complete').toLowerCase();
  const baseSlug = normalizedSlug.split('-')[0] ?? normalizedSlug;

  return [
    `${normalizedSlug}-${normalizedFrom}-to-${normalizedTo}`,
    `${baseSlug}-${normalizedFrom}-to-${normalizedTo}`,
    `${normalizedFrom}-to-${normalizedTo}`,
    `${baseSlug}-${normalizedFrom}`,
  ];
}

export async function resolveJourneyMessage(
  pathSlug: string,
  fromStage: string,
  toStage: string | null,
): Promise<JourneyMessageConfig> {
  const candidates = buildCandidateKeys(pathSlug, fromStage, toStage);

  for (const candidate of candidates) {
    const message = await loadByKey(candidate);
    if (message) {
      return message;
    }
  }

  return { ...FALLBACK_MESSAGE } satisfies JourneyMessageConfig;
}

export type { JourneyMessageConfig } from './types';
