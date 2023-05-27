/**
 * Utility function to run the demo modules and group their console outputs.
 */
export async function runAsSection(f: Function, sectionName: string) {
  console.groupCollapsed(sectionName);
  await f();
  console.groupEnd();
}
