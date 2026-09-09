export function inferFileType(mimetype: string): string {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("audio/")) return "audio";
  if (mimetype === "application/pdf") return "pdf";
  if (mimetype.includes("spreadsheet") || mimetype.includes("excel")) return "spreadsheet";
  if (mimetype.includes("presentation") || mimetype.includes("powerpoint")) return "presentation";
  return "document";
}
