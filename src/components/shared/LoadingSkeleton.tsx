// src/components/shared/LoadingSkeleton.tsx
export function PostSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-300 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-32 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
      <div className="h-64 bg-gray-300 rounded-xl mb-4" />
      <div className="flex gap-4">
        <div className="h-8 bg-gray-200 rounded w-16" />
        <div className="h-8 bg-gray-200 rounded w-16" />
        <div className="h-8 bg-gray-200 rounded w-16" />
      </div>
    </div>
  );
}

export function StorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 animate-pulse">
      <div className="w-16 h-16 bg-gray-300 rounded-full" />
      <div className="h-3 bg-gray-200 rounded w-12" />
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <div className="w-12 h-12 bg-gray-300 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-24 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-32" />
      </div>
      <div className="h-8 bg-gray-200 rounded w-20" />
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin`} />
    </div>
  );
}