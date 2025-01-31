import type React from "react"

interface SkeletonProps {
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
}

export const SkeletonText: React.FC<SkeletonProps> = ({ className }) => {
  return <Skeleton className={`h-4 ${className}`} />
}

export const SkeletonCircle: React.FC<SkeletonProps> = ({ className }) => {
  return <Skeleton className={`rounded-full ${className}`} />
}

