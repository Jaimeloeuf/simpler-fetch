import { SimplerFetch } from "simpler-fetch";

export const sf = new SimplerFetch({
  baseUrlConfigs: {
    v1: {
      url: "http://localhost:3000/v1",
    },

    // Different base Urls can be useful for API service with different versions
    v2: {
      url: "http://localhost:3000/v2",
    },

    // It can also be useful for interfacing with external API
    stripeBilling: {
      url: "http://api.stripe.com/billing",
    },
  },
});
