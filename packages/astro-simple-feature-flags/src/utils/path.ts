export const stripLastExtension = (path: string): string => {
  const lastDotIndex = path.lastIndexOf(".");
  if (lastDotIndex === -1) return path; // No extension found
  return path.slice(0, lastDotIndex);
};
