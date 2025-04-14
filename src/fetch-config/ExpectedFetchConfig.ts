import { ChainableFetchConfig } from "./ChainableFetchConfig";

export type ExpectedFetchConfig<
  NonOptionalFields extends keyof ChainableFetchConfig
> = ChainableFetchConfig & {
  [K in NonOptionalFields]-?: Exclude<ChainableFetchConfig[K], undefined>;
};
