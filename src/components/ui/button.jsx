import * as React from "react"
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        /* --- Brand variants: Core Blue / Cyan / Navy --- */
        brand: "bg-brand text-white hover:bg-brand-dark",
        cyan: "bg-accent-cyan text-deep-blue hover:bg-accent-cyan-dark",
        navy: "bg-accent-navy text-white hover:bg-accent-navy-dark",
        text: "rounded-none border-b border-current text-brand hover:text-brand-dark",
        /* Tab Operations: trạng thái quyết định màu, không phải thứ tự tab */
        tab: "border border-core-blue/20 bg-white text-deep-blue shadow-[0_2px_8px_rgba(0,29,89,0.08)] hover:border-core-blue/45 hover:bg-cyan/10 aria-pressed:border-transparent aria-pressed:bg-brand aria-pressed:text-white aria-pressed:shadow-[0_12px_26px_-8px_rgba(0,66,162,0.65)]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
        /* --- Bankist pill sizes --- */
        pill: "h-auto rounded-full px-[45px] py-[12px] text-[16px] font-medium",
        "pill-sm": "h-auto rounded-full px-[25px] py-[8px] text-[17px] font-normal",
        "pill-lg": "h-auto rounded-full px-[50px] py-[20px] text-[19px] font-medium",
        text: "h-auto p-0 pb-[2px] text-[17px] font-medium",
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
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
