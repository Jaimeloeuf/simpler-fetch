/**
 * Utility function to run the demo modules and group their console outputs.
 */
export async function runAsSection(f: Function, sectionName: string) {
  console.groupCollapsed(sectionName);
  await f();
  console.groupEnd();
}

/**
 * Singleton object used to manage the console log printing process.
 */
export const Print = {
  // Aliases for the console methods to make access uniform through `Print`
  log: console.log,
  err: console.error,

  /**
   * Start a new nested group before printing
   */
  start(groupName: string) {
    console.groupCollapsed(groupName);
  },

  /**
   * End the last created nested group
   */
  end() {
    console.groupEnd();
  },

  /**
   * Print something as a nested group
   */
  group(groupName: string, ...optionalParams: any[]) {
    console.groupCollapsed(groupName);
    console.log(...optionalParams);
    console.groupEnd();
  },
};
