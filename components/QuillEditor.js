"use client";

import { useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";

export default function QuillEditor({ initialValue, onChange }) {
  const editorRef = useRef(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let active = true;
    let quill;
    let handleChange;

    async function createEditor() {
      const { default: Quill } = await import("quill");
      if (!active || !editorRef.current) return;
      quill = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["blockquote", "code-block"],
            ["link"],
            ["clean"],
          ],
        },
      });
      quill.clipboard.dangerouslyPasteHTML(initialValue || "<p><br></p>");
      handleChange = () => onChangeRef.current(quill.root.innerHTML);
      quill.on("text-change", handleChange);
    }

    createEditor();
    return () => {
      active = false;
      if (quill && handleChange) quill.off("text-change", handleChange);
      if (editorRef.current) editorRef.current.replaceChildren();
    };
  }, []);

  return (
    <div className="quill-editor rounded-md border border-[#E0E0E0] bg-white">
      <div ref={editorRef} />
    </div>
  );
}
