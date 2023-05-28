/**
 * Utility function to group all console outputs of a given function.
 */
export async function printGroup(groupName: string, f: Function) {
  console.groupCollapsed(groupName);
  await f();
  console.groupEnd();
}
