import { sf } from "simpler-fetch";
import { baseIdentifier } from "./0 Base Identifiers.js";

// Set Base URLs of your API services.
// Leave out the trailing '/' if you plan to use a starting '/' for every API call.
//
// Alternatively, if you would like to have your URL injected from a .env file, e.g. using VITE
// sf.addBase("identifier", import.meta.env.VITE_API_URL);
//
// Alternatively, if you would like to use different base URLs for different build modes,
// Base URL can be set like this if using a bundler that injects NODE_ENV in
// sf.addBase(
//   "identifier",
//   process.env.NODE_ENV === "production"
//     ? "https://deployed-api.com"
//     : "http://localhost:3000"
// );
//
// Alternatively, if you would like to use different base URLs for different build modes,
// Base URL can be set like this if using a bundler that sets the `import.meta` attributes
// sf.addBase(
//   "identifier",
//   import.meta.env.MODE === "development"
//     ? "http://localhost:3000"
//     : "https://api.example.com"
// );
sf.addBase(baseIdentifier.v1, "http://localhost:3000/v1")

  // Different base Urls can be useful for API service with different versions
  .addBase(baseIdentifier.v2, "http://localhost:3000/v2")

  // It can also be useful for interfacing with external API
  .addBase(baseIdentifier.billing, "http://api.stripe.com/billing")

  // Set v1 as the default base url
  .setDefault(baseIdentifier.v1);
