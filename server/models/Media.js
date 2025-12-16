import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String },
        thumbnailUrl: { type: String },
        sourceUrl: { type: String, required: true },
        mediaType: { type: String, enum: ['video', 'image'], required: true },
        duration: { type: String },
        views: { type: Number, default: 0 },
        creatorName: { type: String, required: true },
        creatorAvatar: { type: String },
        tags: { type: [String], default: [] },
        isPremium: { type: Boolean, default: false },
        price: { type: Number },
        uploadedAt: { type: Date, default: Date.now },
        fileName: { type: String },
    },
    {
        timestamps: true,
    }
);

mediaSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

mediaSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
        delete ret._id;
    },
});

const Media = mongoose.model('Media', mediaSchema);

export default Media;
