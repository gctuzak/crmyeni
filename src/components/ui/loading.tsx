"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  text?: string
  className?: string
  iconClassName?: string
  size?: "sm" | "md" | "lg"
  centered?: boolean
}

export function Loading({
  text = "Yükleniyor...",
  className,
  iconClassName,
  size = "md",
  centered = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  const textClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  const containerClasses = centered
    ? "flex flex-col items-center justify-center h-full"
    : "flex flex-row items-center gap-2"

  return (
    <div className={cn(containerClasses, className)}>
      <Loader2
        className={cn(
          "animate-spin text-muted-foreground",
          sizeClasses[size],
          iconClassName
        )}
      />
      {text && <span className={cn("text-muted-foreground", textClasses[size])}>{text}</span>}
    </div>
  )
}

export function PageLoading({ text = "Sayfa yükleniyor..." }: { text?: string }) {
  return (
    <div className="w-full h-[50vh] flex items-center justify-center">
      <Loading text={text} size="lg" centered />
    </div>
  )
}

export function TableLoading() {
  return (
    <div className="w-full py-24 flex items-center justify-center">
      <Loading text="Veriler yükleniyor..." size="md" centered />
    </div>
  )
}

export function ButtonLoading({ className }: { className?: string }) {
  return <Loader2 className={cn("animate-spin h-4 w-4", className)} />
} 