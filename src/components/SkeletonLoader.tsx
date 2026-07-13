import { FC } from 'react';
import Skeleton from '@mui/material/Skeleton';
import { SxProps, Theme } from '@mui/system';

interface SkeletonParams {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
}

interface SkeletonLoaderProps {
    params: SkeletonParams
    sx?: SxProps<Theme>;
}

const SkeletonLoader: FC<SkeletonLoaderProps> = ({ params, sx }) => {
    const {
        width = '100px',
        height = '20px',
        borderRadius = '4px',
    } = params;

    return (
        <Skeleton
            variant="rectangular"
            width={width}
            height={height}
            sx={{ borderRadius, ...sx }}
        />
    );
};

export default SkeletonLoader;
