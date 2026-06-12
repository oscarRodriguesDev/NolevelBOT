import { SkeletonTable } from "@/app/components/skeleton"

export default function Loading() {
  return (
    <div className="py-10 px-4" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <div className="max-w-7xl mx-auto">
        <SkeletonTable rows={6} cols={6} />
      </div>
    </div>
  )
}
