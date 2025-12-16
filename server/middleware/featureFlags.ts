import { features } from '../config';

export function featureFlagsMiddleware(req, res, next) {
    res.locals.featureFlags = {
        enableGpt51CodexMaxPreview: features.enableGpt51CodexMaxPreview,
    };
    next();
}