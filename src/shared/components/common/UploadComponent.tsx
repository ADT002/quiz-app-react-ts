import { useState } from 'react'
import { uploadFileToS3 } from './handleUpload'
import { useNavigate } from 'react-router-dom'

export default function UploadFile() {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const handleUpload = async () => {
        if (!file) return

        try {
            setLoading(true)
            const fileMeta = await uploadFileToS3(file, navigate)
            alert('Upload success')
        } catch (err) {
            console.error(err)
            alert('Upload failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <button onClick={handleUpload} disabled={!file || loading}>
                {loading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    )
}
