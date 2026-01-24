interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
}

export const Skeleton = ({ className = '', width, height }: SkeletonProps) => {
    return (
        <div
            className={`bg-gray-200 animate-pulse rounded-lg ${className}`}
            style={{ width, height }}
        />
    );
};
