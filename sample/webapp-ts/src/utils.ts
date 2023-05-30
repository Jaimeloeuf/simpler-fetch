/**
 * Utility function to group all console outputs of a given function.
 */
export async function printGroup(
  groupName: string | Array<string>,
  f: Function
) {
  console.groupCollapsed(
    Array.isArray(groupName) ? groupName.join("\n") : groupName
  );

  await f();

  console.groupEnd();
}
