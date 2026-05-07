import CustomEditor from "./CustomEditor";

export default function PostEditor() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        maxWidth: "800px",
        aspectRatio: "1 / 1.414",
        margin: "auto",
      }}
    >
      <CustomEditor width="100%" height="100%" border={true} />
    </div>
  );
}
