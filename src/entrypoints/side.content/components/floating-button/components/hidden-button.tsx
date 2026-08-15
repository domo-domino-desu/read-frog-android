import type { FloatingButtonSide } from "@/types/config/floating-button"
import { cn } from "@/utils/styles/utils"

export default function HiddenButton({
  icon,
  onClick,
  children,
  className,
  side = "right",
  expanded = false,
  title,
}: {
  icon: React.ReactNode
  onClick: () => void
  children?: React.ReactNode
  className?: string
  side?: FloatingButtonSide
  expanded?: boolean
  title?: string
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      className={cn(
        "cursor-pointer rounded-full border border-border bg-white p-1.5 text-neutral-600 shadow-lg transition-transform duration-300 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800",
        side === "right" ? "mr-2" : "ml-2",
        expanded ? "translate-x-0" : side === "right" ? "translate-x-12" : "-translate-x-12",
        className,
      )}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  )
}
