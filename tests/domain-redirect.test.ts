import { describe, expect, it } from 'vitest';
import { onRequest } from '../functions/_middleware.js';

const env = { SITE_URL: 'https://guide.example' };
describe('Pages canonical host redirect', () => {
  it('upgrades the apex to HTTPS while preserving the path and query', () => {
    const response = onRequest({
      request: new Request('http://guide.example/guides/?source=nav'),
      env,
      next: () => new Response('static'),
    });
    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe('https://guide.example/guides/?source=nav');
  });
  it('redirects www to HTTPS apex while preserving path and query', () => {
    const response = onRequest({
      request: new Request('http://www.guide.example/songs/song-list/?decade=2020s&artist=A%26B'),
      env,
      next: () => new Response('static'),
    });
    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe(
      'https://guide.example/songs/song-list/?decade=2020s&artist=A%26B',
    );
  });
  it.each([
    'https://guide.example/',
    'https://project.pages.dev/',
    'https://preview.project.pages.dev/',
    'https://another.example/',
  ])('keeps %s serving static content', (url) => {
    const response = onRequest({
      request: new Request(url),
      env,
      next: () => new Response('static'),
    });
    expect(response.status).toBe(200);
    expect(response.headers.has('location')).toBe(false);
  });
});
