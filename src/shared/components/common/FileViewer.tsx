// components/files/FileViewer.tsx
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getPresignedDownloadUrl } from "./handleUpload"

type Props = {
    filename: string
    contentType?: string
    className?: string
    author_mail?: string
}

const CACHE_TTL = 15 * 60 * 1000 // 15 phút

function getCachedUrl(key: string): string | null {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null

    const { url, expiredAt } = JSON.parse(raw)
    if (Date.now() > expiredAt) {
        sessionStorage.removeItem(key)
        return null
    }
    return url
}

function setCachedUrl(key: string, url: string) {
    sessionStorage.setItem(
        key,
        JSON.stringify({
            url,
            expiredAt: Date.now() + CACHE_TTL,
        })
    )
}


export default function FileViewer({
    filename,
    contentType,
    className,
    author_mail,
}: Props) {
    const navigate = useNavigate()
    const [url, setUrl] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
        const fetchUrl = async () => {
            try {
                setLoading(true)
                const cacheKey = `file:${author_mail ?? "self"}:${filename}`

                const cached = getCachedUrl(cacheKey)
                if (cached) {
                    setUrl(cached)
                    return
                }
                const presignedUrl = author_mail ? await getPresignedDownloadUrl(filename, navigate, author_mail) : await getPresignedDownloadUrl(filename, navigate)
                setCachedUrl(cacheKey, presignedUrl)
                if (mounted) setUrl(presignedUrl)
            } catch (err) {
                console.error(err)
                // if (mounted) setError("Cannot load file")
            } finally {
                if (mounted) setLoading(false)
            }
        }

        fetchUrl()

        return () => {
            mounted = false
        }
    }, [filename, navigate])

    if (loading) return <div>Loading file...</div>
    if (error) return <div className="text-red-500">{error}</div>
    if (!url) return null

    const type = contentType ?? guessContentType(filename)

    // 🖼 IMAGE
    if (type.startsWith("image/")) {
        return (
            <img
                src={url}
                alt={filename}
                className={className ?? "max-w-full rounded"}
            />
        )
    }

    // 🎵 AUDIO
    if (type.startsWith("audio/")) {
        return (
            <audio controls className="w-full">
                <source src={url} type={type} />
            </audio>
        )
    }

    // 🎬 VIDEO
    if (type.startsWith("video/")) {
        return (
            <video controls className={className ?? "w-full rounded"}>
                <source src={url} type={type} />
            </video>
        )
    }

    // 📄 PDF
    if (type === "application/pdf") {
        return (
            <iframe
                src={url}
                className={className ?? "w-full h-[600px] border rounded"}
                title={filename}
            />
        )
    }

    // 📎 FALLBACK
    // return (
    //     <a
    //         href={url}
    //         download
    //         className="inline-block px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
    //     >
    //         Download {filename}
    //     </a>
    // )
}

/**
 * Guess content-type from filename
 */
function guessContentType(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase()

    switch (ext) {
        case "png":
        case "jpg":
        case "jpeg":
        case "gif":
        case "webp":
            return "image/" + ext

        case "mp3":
            return "audio/mpeg"
        case "wav":
            return "audio/wav"

        case "mp4":
        case "webm":
            return "video/" + ext

        case "pdf":
            return "application/pdf"

        default:
            return "application/octet-stream"
    }
}
