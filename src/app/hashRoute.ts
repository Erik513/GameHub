export const homeRoute = "/";

export function parseHashRoute(hash: string): string {
  const route = hash.replace(/^#/, "");
  return route.startsWith("/") ? route : homeRoute;
}

export function createRouteHash(route: string): string {
  return `#${route.startsWith("/") ? route : homeRoute}`;
}
