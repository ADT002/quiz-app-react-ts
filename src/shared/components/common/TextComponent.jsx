import React from "react";
import { useNode } from "@craftjs/core";
import { Editor } from "draft-js";

export default function TextComponent({ editorState, setEditorState }) {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div ref={connect} draggable ref={drag}>
      <Editor editorState={editorState} onChange={setEditorState} />
    </div>
  );
}
