import path from 'path';
import Media from '../models/Media.js';

const buildFileUrl = (req, filename) => {
    if (!filename) return null;
    const baseUrl = process.env.FILE_BASE_URL || `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}/uploads/${filename}`;
};

export const listMedia = async (_req, res, next) => {
    try {
        const media = await Media.find().sort({ createdAt: -1 });
        res.json(media);
    } catch (err) {
        next(err);
    }
};

export const getMedia = async (req, res, next) => {
    try {
        const media = await Media.findById(req.params.id);
        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }
        res.json(media);
    } catch (err) {
        next(err);
    }
};

export const createMedia = async (req, res, next) => {
    try {
        const {
            userId,
            title,
            description,
            mediaType,
            duration,
            creatorName,
            creatorAvatar,
            tags,
            isPremium,
            price,
            thumbnailUrl,
        } = req.body;

        const fileName = req.file ? req.file.filename : undefined;
        const sourceUrl = req.file ? buildFileUrl(req, req.file.filename) : req.body.sourceUrl;
        const parsedTags = typeof tags === 'string' ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : tags || [];

        const media = await Media.create({
            userId,
            title,
            description,
            mediaType,
            duration,
            creatorName,
            creatorAvatar,
            tags: parsedTags,
            isPremium: isPremium === 'true' || isPremium === true,
            price: price ? Number(price) : undefined,
            thumbnailUrl: req.file && mediaType === 'video' ? thumbnailUrl : thumbnailUrl || sourceUrl,
            sourceUrl,
            fileName,
        });

        res.status(201).json(media);
    } catch (err) {
        next(err);
    }
};

export const updateMedia = async (req, res, next) => {
    try {
        const updates = { ...req.body };
        if (updates.tags && typeof updates.tags === 'string') {
            updates.tags = updates.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
        }

        if (req.file) {
            updates.fileName = req.file.filename;
            updates.sourceUrl = buildFileUrl(req, req.file.filename);
        }

        const media = await Media.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }
        res.json(media);
    } catch (err) {
        next(err);
    }
};

export const deleteMedia = async (req, res, next) => {
    try {
        const media = await Media.findByIdAndDelete(req.params.id);
        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};
