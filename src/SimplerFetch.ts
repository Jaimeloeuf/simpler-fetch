import type { BaseUrlConfig } from "./types/BaseUrlConfig";
import { MethodBuilder } from "./MethodBuilder";

export class SimplerFetch<
  const BaseUrlConfigs extends Record<string, BaseUrlConfig>,
  const BaseUrlIdentifiers extends keyof BaseUrlConfigs = keyof BaseUrlConfigs
> {
  readonly #urlIdToMethodBuilder = new Map<BaseUrlIdentifiers, MethodBuilder>();

  constructor(baseUrlConfigs: BaseUrlConfigs) {
    for (const [baseUrlIdentifier, baseUrlConfig] of Object.entries(
      baseUrlConfigs
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
}
