type PixelPresence = {
  hasMetaPixel: boolean;
  hasGoogleAnalytics: boolean;
  hasTikTokPixel: boolean;
};

export async function checkTrackingPixels(url: string): Promise<PixelPresence> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Could not fetch page (status ${res.status})`);
  }
  const html = await res.text();

  return {
    hasMetaPixel: /connect\.facebook\.net|fbq\(/i.test(html),
    hasGoogleAnalytics: /googletagmanager\.com\/gtag|google-analytics\.com/i.test(html),
    hasTikTokPixel: /analytics\.tiktok\.com/i.test(html),
  };
}
