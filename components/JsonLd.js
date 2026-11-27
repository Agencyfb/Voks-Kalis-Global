export default function JsonLd({ data }) {
  if (!data) return null;
  const items = Array.isArray(data) ? data.filter(Boolean) : [data];
  if (!items.length) return null;

  return items.map((entry, index) => (
    <script
      key={index}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(entry).replace(/</g, "\\u003c"),
      }}
    />
  ));
}
