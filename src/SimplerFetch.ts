import type { BaseUrlConfig } from "./types/BaseUrlConfig";
import { sfError } from "./errors";
import { MethodBuilder } from "./MethodBuilder";

export class SimplerFetch<
  const SimplerFetchConfig extends {
    baseUrlConfigs: Record<string, BaseUrlConfig>;

    /**
     * Set given identifier as the default baseUrlConfig to use so that you
     * can easily use this default mapping in your API calls.
     */
    defaultBaseUrlIdentifier?: keyof SimplerFetchConfig["baseUrlConfigs"];
  },
  const BaseUrlIdentifiers extends keyof SimplerFetchConfig["baseUrlConfigs"] = keyof SimplerFetchConfig["baseUrlConfigs"]
> {
  readonly #urlIdToMethodBuilder = new Map<BaseUrlIdentifiers, MethodBuilder>();

  constructor(public readonly config: SimplerFetchConfig) {
    for (const [baseUrlIdentifier, baseUrlConfig] of Object.entries(
      config.baseUrlConfigs
    ) as Array<
      [
        BaseUrlIdentifiers,
        SimplerFetchConfig["baseUrlConfigs"][BaseUrlIdentifiers]
      ]
    >) {
      this.#urlIdToMethodBuilder.set(
        baseUrlIdentifier,
        new MethodBuilder({
          url: baseUrlConfig.url,
          defaultOptions: baseUrlConfig.defaultOptions ?? {},
          defaultHeaders: baseUrlConfig.defaultHeaders ?? [],
        })
      );
    }

    this.#defaultBaseUrlIdentifier =
      config.defaultBaseUrlIdentifier as BaseUrlIdentifiers;
  }

  useBaseUrl(identifier: BaseUrlIdentifiers) {
    // @todo Explain why we can use non-null assertion here
    return this.#urlIdToMethodBuilder.get(identifier)!;
  }

  /**
   * Private property used to track default base URL identifier set by user.
   */
  #defaultBaseUrlIdentifier?: BaseUrlIdentifiers;

  /**
   * Use the default baseUrl set with `setDefaultBaseUrl`.
   */
  // The generic return type at compile time ensures whether user can access the
  // default base URL MethodBuilder.
  useDefaultBaseUrl(): "defaultBaseUrlIdentifier" extends keyof SimplerFetchConfig
    ? MethodBuilder
    : never {
    if (this.#defaultBaseUrlIdentifier === undefined) {
      throw new sfError("sf: Default identifier not set");
    }

    // Needs casting to ensure that it can work with the generic type.
    return this.useBaseUrl(
      this.#defaultBaseUrlIdentifier
    ) as "defaultBaseUrlIdentifier" extends keyof SimplerFetchConfig
      ? MethodBuilder
      : never;
  }
}
