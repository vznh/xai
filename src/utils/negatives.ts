const NEGATIVE_MAPPINGS: Record<string, string> = {
  'no-glassmorphism': 'no-blur',
  'no-transparency': 'no-opacity',
  'no-shadows': 'no-shadow',
  'no-rounded': 'no-border-radius',
  'no-gradients': 'no-gradient',
  'no-animations': 'no-motion',
  'no-dark-mode': 'no-dark'
};

export function normalizeNegatives(negatives: string[]): string[] {
  return negatives.map(negative => {
    const normalized = negative.toLowerCase().trim();
    return NEGATIVE_MAPPINGS[normalized] || normalized;
  }).filter(Boolean);
}