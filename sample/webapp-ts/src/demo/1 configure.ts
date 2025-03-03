import { sf } from "simpler-fetch";

declare module "simpler-fetch" {
  interface sf_BaseUrlObject {
    v1: string;

    /**
     * Different base Urls can be useful for API service with different versions
     */
    v2: string;

    /**
     * It can also be useful for interfacing with external API
     */
    stripeBilling: string;
  }
}

/*
 * Set Base URLs of your API services.
 * Leave out trailing '/' if you plan to use a starting '/' for every API call.
 *
 * Alternatively, if you would like to have your URL injected from a .env file, e.g. using VITE
 * ```typescript
 * sf.setBaseUrls({
 *     "your_identifier", import.meta.env.VITE_API_URL
 * });
 * ```
 *
 * Alternatively, if you would like to use different base URLs for different
 * build modes, base URLs can be set like this if using a bundler that injects
 * NODE_ENV in
 * ```typescript
 * sf.setBaseUrls({
 *   "your_identifier": process.env.NODE_ENV === "production"
 *                  ? "https://deployed-api.com"
 *                  : "http://localhost:3000"
 * });
 * ```
 *
 * Alternatively, if you would like to use different base URLs for different build modes,
 * Base URL can be set like this if using a bundler that sets the `import.meta` attributes
 * ```typescript
 * sf.setBaseUrls({
 *   "your_identifier": import.meta.env.MODE === "development"
 *                  ? "http://localhost:3000"
 *                  : "https://deployed-api.com"
 * });
 * ```
 */
sf
  // Record<baseUrlIdentifiers, baseUrls>
  .setBaseUrls({
    v1: "http://localhost:3000/v1",

    // Different base Urls can be useful for API service with different versions
    v2: "http://localhost:3000/v2",

    // It can also be useful for interfacing with external API
    stripeBilling: "http://api.stripe.com/billing",
  })

  // Optionally choose one of the baseUrls as the default one
  .setDefaultBaseUrl("v1");
