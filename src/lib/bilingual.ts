export function getBilingualField(
  locale: string,
  field_ar: string | null | undefined,
  field_en: string | null | undefined,
): string {
  if (locale === "ar") {
    return field_ar && field_ar.trim() !== "" ? field_ar : (field_en ?? "");
  }
  return field_en ?? "";
}
