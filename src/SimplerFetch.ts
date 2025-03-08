import type { BaseUrlConfig } from "./types/BaseUrlConfig";
import { sfError } from "./errors";
import { MethodBuilder } from "./MethodBuilder";

export class SimplerFetch<
  const BaseUrlConfigs extends Record<string, BaseUrlConfig>,
  const SimplerFetchConfig extends {
    baseUrlConfigs: BaseUrlConfigs;
  },
  const BaseUrlIdentifiers extends keyof BaseUrlConfigs = keyof BaseUrlConfigs
> {
  readonly #urlIdToMethodBuilder = new Map<BaseUrlIdentifiers, MethodBuilder>();

  constructor(config: SimplerFetchConfig) {
    for (const [baseUrlIdentifier, baseUrlConfig] of Object.entries(
      config.baseUrlConfigs
    ) as Array<[BaseUrlIdentifiers, BaseUrlConfigs[BaseUrlIdentifiers]]>) {
      this.#urlIdToMethodBuilder.set(
        baseUrlIdentifier,
        new MethodBuilder({
          url: baseUrlConfig.url,
          defaultOptions: baseUrlConfig.defaultOptions ?? {},
          defaultHeaders: baseUrlConfig.defaultHeaders ?? [],
        })
      );
    }
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
   * Set a particular identifier and baseUrl mapping as the default mapping to
   * use so that you can easily use this default mapping in your API calls.
   *
   * When called this overrides any previously set default baseUrl mapping, and
   * this method should ideally only be ever called once in your whole app.
   */
  setDefaultBaseUrl(identifier: BaseUrlIdentifiers) {
    this.#defaultBaseUrlIdentifier = identifier;
  }

  /**
   * Use the default baseUrl set with `setDefaultBaseUrl`.
   */
  useDefaultBaseUrl() {
    if (this.#defaultBaseUrlIdentifier === undefined) {
      throw new sfError("sf: Default identifier not set");
    }

    return this.useBaseUrl(this.#defaultBaseUrlIdentifier);
  }
}
