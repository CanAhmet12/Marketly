/** Pexels arka plan — 16:9 kırpım, webp, responsive srcset */
export function pexelsBgUrl(id: number, w = 1920, h = 1080) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop&fm=webp`;
}

export function pexelsBgSrcSet(id: number) {
  const h = (w: number) => Math.round((w * 9) / 16);
  return [960, 1280, 1600, 1920].map((w) => `${pexelsBgUrl(id, w, h(w))} ${w}w`).join(", ");
}

export type WelcomeBgConfig = {
  pexelsId: number;
  focal: string;
};

export function resolveWelcomeBg({ pexelsId, focal }: WelcomeBgConfig) {
  return {
    url: pexelsBgUrl(pexelsId),
    srcSet: pexelsBgSrcSet(pexelsId),
    focal,
  };
}
