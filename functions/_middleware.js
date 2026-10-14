/** Normalize this site's www host; all other requests serve static assets. */
export function onRequest({ request, env, next }) {
  const canonical = new URL(env.SITE_URL);
  const url = new URL(request.url);
  if (
    url.hostname === `www.${canonical.hostname}` ||
    (url.hostname === canonical.hostname && url.protocol !== canonical.protocol)
  ) {
    url.protocol = canonical.protocol;
    url.hostname = canonical.hostname;
    url.port = canonical.port;
    return Response.redirect(url.toString(), 301);
  }
  return next();
}
