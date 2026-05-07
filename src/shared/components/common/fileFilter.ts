// utils/fileFilter.ts

import { FileTab } from "~/shared/types/file/fileTab"

export type FileMeta = {
    id: string
    filename: string
    fileType: string
    size: number
}

export function getFileTab(file: FileMeta): FileTab {
    if (file.fileType.startsWith("image/")) return "image"
    if (file.fileType.startsWith("video/")) return "video"
    if (file.fileType.startsWith("audio/")) return "audio"

    if (
        file.fileType === "application/pdf" ||
        file.fileType.includes("officedocument") ||
        file.fileType === "text/plain"
    ) {
        return "document"
    }

    return "document"
}

export function filterFilesByTab(
    files: FileMeta[],
    tab: FileTab
) {
    if (tab === "all") return files
    return files.filter(f => getFileTab(f) === tab)
}
