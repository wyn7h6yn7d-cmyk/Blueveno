import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,filter,transform,opacity] duration-200 ease-out outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.09_0.038_266)] active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:saturate-75 disabled:opacity-45 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(180deg,oklch(0.76_0.14_250),oklch(0.67_0.15_252))] text-[oklch(0.1_0.04_265)] shadow-[0_1px_0_0_oklch(1_0_0_/0.14)_inset,0_14px_36px_-14px_oklch(0.44_0.14_252/0.6)] hover:brightness-[1.04]",
        outline:
          "border-white/[0.14] bg-white/[0.035] text-zinc-200 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.05)] hover:bg-white/[0.08] hover:text-zinc-50 aria-expanded:bg-white/[0.08] aria-expanded:text-zinc-50",
        secondary:
          "bg-[linear-gradient(180deg,oklch(0.27_0.06_262/0.92),oklch(0.18_0.045_266/0.96))] text-zinc-100 hover:brightness-[1.05] aria-expanded:brightness-[1.04]",
        ghost:
          "text-zinc-300 hover:bg-white/[0.06] hover:text-zinc-50 aria-expanded:bg-white/[0.06] aria-expanded:text-zinc-50",
        destructive:
          "border border-rose-500/26 bg-rose-500/[0.12] text-rose-100 hover:bg-rose-500/[0.18] focus-visible:border-rose-400/45 focus-visible:ring-rose-500/28",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 rounded-xl px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-1.5 rounded-xl px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-9 rounded-xl",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
