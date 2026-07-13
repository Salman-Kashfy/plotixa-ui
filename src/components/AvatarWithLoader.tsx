import { useState, useEffect } from 'react';
import { Box, Avatar, Skeleton } from '@mui/material';

interface AvatarWithLoaderProps {
    src?: string;
    alt?: string;
    sx?: any;
    size?: number;
    onClick?: () => void;
}

function AvatarWithLoader({ src, alt, sx, size = 30, onClick }: AvatarWithLoaderProps) {
    const hasImageUrl = src && src.trim() !== '';
    const [imageLoading, setImageLoading] = useState(hasImageUrl);
    const [imageError, setImageError] = useState(false);

    // Reset loading state when src changes
    useEffect(() => {
        const hasUrl = src && src.trim() !== '';
        setImageLoading(hasUrl);
        setImageError(false);
    }, [src]);

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const handleImageError = () => {
        setImageLoading(false);
        setImageError(true);
    };

    return (
        <Box sx={{ position: 'relative', display: 'inline-block', ...sx }}>
            {imageLoading && hasImageUrl && (
                <Skeleton
                    variant="circular"
                    width={size}
                    height={size}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                    }}
                />
            )}
            <Avatar
                src={imageError || !hasImageUrl ? undefined : src}
                alt={alt}
                onLoad={handleImageLoad}
                onError={handleImageError}
                onClick={onClick}
                sx={{
                    width: size,
                    height: size,
                    opacity: imageLoading && hasImageUrl ? 0 : 1,
                    transition: 'opacity 0.3s ease',
                    cursor: onClick && src ? 'pointer' : 'default',
                }}
            />
        </Box>
    );
}

export default AvatarWithLoader;

