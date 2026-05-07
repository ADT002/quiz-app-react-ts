// types/fileTab.ts
export type FileTab =
    | "all"
    | "image"
    | "video"
    | "audio"
    | "document"

export type FileMeta = {
    id: string
    filename: string
    fileType: string
    size: number
}