export function decodeGalleryCursor(value) {
  if (!value || value.length > 200) return null;

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (typeof parsed.createdAt !== "string" || Number.isNaN(Date.parse(parsed.createdAt))
      || typeof parsed.id !== "string" || !/^[a-f\d]{24}$/i.test(parsed.id)) {
      return null;
    }
    return { createdAt: new Date(parsed.createdAt), id: parsed.id };
  } catch {
    return null;
  }
}

export function encodeGalleryCursor(item) {
  return Buffer.from(JSON.stringify({
    createdAt: item.createdAt.toISOString(),
    id: item._id.toString(),
  })).toString("base64url");
}
