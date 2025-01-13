export function GamesListSkeleton() {
    return (
        <div className="space-y-4">
            {/* Refresh settings skeleton */}
            <div className="bg-background/50 rounded-md px-3 py-2 h-[72px] animate-pulse" />

            {/* Game cards skeleton */}
            <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="rounded-lg bg-card shadow-sm w-full h-[120px] animate-pulse"
                    />
                ))}
            </div>
        </div>
    )
} 