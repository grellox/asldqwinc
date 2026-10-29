import { asset } from '../lib/assets';

/**
 * Real media for the landing and sign-in screens.
 *
 * Files live in `public/images/`. Any slot left empty falls back to the drawn
 * artwork, so a half-filled file is fine. `asset()` resolves the path against
 * the deploy base, so links work in dev and under GitHub Pages alike.
 */
export const media = {
  /** Hero background. Shot vertical, so it is cropped to a band and mirrored:
   *  the dark side of the frame falls under the headline, the window light and
   *  the children's drawings stay on the open side. */
  heroPhoto: asset('images/collage-madre.webp'),
  /** Behind the dark panel of the sign-in screen. */
  loginPhoto: asset('images/login-arequipa.webp'),
  /** Wide plate that closes the page: the city the directory actually works in. */
  cityPhoto: asset('images/hero-arequipa.webp'),
  /** Stone texture laid over the dark band, at low opacity. */
  bandTexture: asset('images/sillar-texture.webp'),
  /** Replaces the built-in walkthrough with a video. Still empty. */
  walkthroughVideo: '',
  /** Still frame shown before that video loads. */
  walkthroughPoster: '',
};
