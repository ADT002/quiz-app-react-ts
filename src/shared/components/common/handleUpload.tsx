import { NavigateFunction } from "react-router-dom";
import API_ENDPOINTS from "~/app/config"
import { apiCallGet, apiCallPost } from "~/shared/services/apiCallService"


type PresignUploadResponse = {
    upload_url: string
    file: any
}


export async function uploadFileToS3(
    file: File,
    navigate: NavigateFunction
) {
    // 1️⃣ Xin presigned URL
    const presignRes = await apiCallPost<PresignUploadResponse>(
        API_ENDPOINTS.UPLOAD,
        {
            filename: file.name,
            content_type: file.type,
            size: file.size,
        },
        navigate
    )

    const { upload_url, file: fileMeta } = presignRes

    // 2️⃣ PUT file lên S3 (CỰC KỲ QUAN TRỌNG)
    const uploadRes = await fetch(upload_url, {
        method: "PUT",
        body: file, // ❗ KHÔNG headers
    })

    if (!uploadRes.ok) {
        throw new Error("Upload to S3 failed")
    }

    // 3️⃣ Thành công
    return fileMeta
}
export async function getDownloadURL(filename: string, navigate: NavigateFunction) {
    const res: Response = await apiCallGet(
        `${API_ENDPOINTS.DOWNLOAD}?filename=${filename}`,
        navigate
    );

    const { url } = await res.json();
    return url;
}

type PresignDownloadResponse = {
    url: string
}
export async function getPresignedDownloadUrl(
    filename: string,
    navigate: NavigateFunction,
    author_mail?: string
): Promise<string> {

    const params = new URLSearchParams({
        filename,
    })

    if (author_mail) {
        params.append("author_email", author_mail)
    }

    const res = await apiCallGet<PresignDownloadResponse>(
        `${API_ENDPOINTS.DOWNLOAD}?${params.toString()}`,
        navigate
    )

    return res.url
}
