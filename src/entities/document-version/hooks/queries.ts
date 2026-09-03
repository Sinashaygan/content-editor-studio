export const documentVersionKeys = {
  all: ["document-versions"] as const,
  list: (documentId: string) =>
    [...documentVersionKeys.all, documentId] as const,
};
