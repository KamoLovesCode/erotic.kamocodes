import axios from 'axios';
import { MediaItem } from '../types';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const client = axios.create({
    baseURL: `${baseURL.replace(/\/$/, '')}/api`,
});

export const mediaApi = {
    async list(): Promise<MediaItem[]> {
        const { data } = await client.get<MediaItem[]>('/media');
        return data;
    },

    async getById(id: string): Promise<MediaItem> {
        const { data } = await client.get<MediaItem>(`/media/${id}`);
        return data;
    },

    async create(formData: FormData, onUploadProgress?: (progress: number) => void): Promise<MediaItem> {
        const { data } = await client.post<MediaItem>('/media', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (event) => {
                if (onUploadProgress && event.total) {
                    const percentage = Math.round((event.loaded * 100) / event.total);
                    onUploadProgress(percentage);
                }
            },
        });
        return data;
    },

    async update(id: string, formData: FormData, onUploadProgress?: (progress: number) => void): Promise<MediaItem> {
        const { data } = await client.put<MediaItem>(`/media/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (event) => {
                if (onUploadProgress && event.total) {
                    const percentage = Math.round((event.loaded * 100) / event.total);
                    onUploadProgress(percentage);
                }
            },
        });
        return data;
    },

    async remove(id: string): Promise<void> {
        await client.delete(`/media/${id}`);
    },
};
