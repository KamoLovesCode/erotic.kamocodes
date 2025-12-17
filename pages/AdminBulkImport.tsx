import React, { useRef, useState } from 'react';
import axios from 'axios';
import { UploadCloud, DownloadCloud, X } from 'lucide-react';

// Inline SVG icon for branding
const Adult18Icon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
        <g stroke="#e11d48" strokeWidth="1.91" fill="none">
            <path d="M19.45,19.42a10.5,10.5,0,1,1,0-14.84" />
            <rect x="11.07" y="8.18" width="4.77" height="3.82" rx="1.91" />
            <rect x="11.07" y="12" width="4.77" height="3.82" rx="1.91" />
            <line x1="7.25" y1="7.23" x2="7.25" y2="15.82" />
            <line x1="5.34" y1="15.82" x2="9.16" y2="15.82" />
            <line x1="5.34" y1="9.14" x2="8.2" y2="9.14" />
            <line x1="17.75" y1="12" x2="23.48" y2="12" />
            <line x1="20.61" y1="9.14" x2="20.61" y2="14.86" />
        </g>
    </svg>
);

interface AdminBulkImportProps {
    onClose?: () => void;
}

const AdminBulkImport: React.FC<AdminBulkImportProps> = ({ onClose }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Download videos JSON export
    const handleDownload = () => {
        window.open('/api/media/export/videos', '_blank');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);
        setLoading(true);
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            setStatus('Please select a JSON file.');
            setLoading(false);
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await axios.post('/api/media/import/videos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setStatus(res.data.message || 'Import successful!');
        } catch (err: any) {
            setStatus(err.response?.data?.message || 'Import failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (onClose) onClose();
        else window.history.back();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl mx-auto p-8 bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800">
                <button
                    type="button"
                    aria-label="Close bulk import"
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
                >
                    <X className="w-6 h-6" />
                </button>
                <div className="flex items-center mb-6">
                    <Adult18Icon />
                    <h2 className="text-3xl font-bold text-white">Bulk Import & Export Videos</h2>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-8">
                    <button
                        onClick={handleDownload}
                        className="flex items-center mb-4 md:mb-0 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-green-700/20 transition-all"
                        type="button"
                    >
                        <DownloadCloud className="w-5 h-5 mr-2 -ml-1" />
                        Download Videos JSON
                    </button>
                    <span className="text-zinc-400 text-sm">Export all video data as a backup file.</span>
                </div>
                <form onSubmit={handleSubmit} className="bg-zinc-950 rounded-2xl p-6 border border-zinc-800">
                    <label className="block text-zinc-300 font-semibold mb-2">Import Videos JSON</label>
                    <input
                        type="file"
                        accept="application/json"
                        ref={fileInputRef}
                        className="mb-4 block w-full text-white file:bg-zinc-800 file:text-zinc-200 file:rounded-lg file:border-0 file:px-4 file:py-2 file:mr-4 file:font-semibold file:hover:bg-zinc-700"
                    />
                    <button
                        type="submit"
                        className="flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-red-700/20 transition-all"
                        disabled={loading}
                    >
                        <UploadCloud className="w-5 h-5 mr-2 -ml-1" />
                        {loading ? 'Importing...' : 'Import JSON'}
                    </button>
                </form>
                {status && (
                    <div
                        className={`mt-6 text-center rounded-xl py-3 px-4 font-semibold ${status.includes('success')
                            ? 'bg-green-900/40 text-green-400 border border-green-700'
                            : 'bg-red-900/40 text-red-400 border border-red-700'
                            }`}
                    >
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBulkImport;
