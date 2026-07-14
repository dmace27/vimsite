import { navigation } from "./navigation";
import { siteRoutes } from "./site-routes.generated";
import { getWritingEntryHref, projects, writing } from "./site-content";

const navigationDetails = new Map(navigation.map((item) => [item.href, item]));

/**
 * Page commands come from the App Router filesystem. Existing navigation data
 * can enrich a generated route, but it is never required for a page to appear.
 * Dynamic route templates stay in the manifest but are excluded here because
 * they need a concrete parameter before the router can open them.
 */
export const commands = siteRoutes
  .filter((route) => !route.dynamic)
  .map((route) => {
    const navigationItem = navigationDetails.get(route.href);

    return {
      label: navigationItem?.label ?? route.label,
      href: route.href,
      detail: navigationItem?.description ?? route.detail,
    };
  });

export const searchItems = [
  ...commands,
  ...projects.map((item) => ({
    label: item.title,
    href: `/projects/${item.slug}`,
    detail: item.summary,
  })),
  ...writing.map((item) => ({
    label: item.title,
    href: getWritingEntryHref(item),
    detail: item.excerpt,
  })),
];
