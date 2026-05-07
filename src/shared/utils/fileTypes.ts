// utils/fileType.ts
export type FileGroup =
    | "image"
    | "video"
    | "audio"
    | "pdf"
    | "other"

export function getFileGroup(filename: string): FileGroup {
    const ext = filename.split(".").pop()?.toLowerCase()

    if (!ext) return "other"

    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "image"
    if (["mp4", "webm", "mov"].includes(ext)) return "video"
    if (["mp3", "wav", "ogg"].includes(ext)) return "audio"
    if (ext === "pdf") return "pdf"

    return "other"
}
