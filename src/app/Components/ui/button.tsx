import * as React from "react";

function cn(...cls: Array<string | undefined | null | false>) {
    return cls.filter(Boolean).join(" ");
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost" | "link";
    size?: "default" | "icon" | "sm" | "lg";
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    default: "bg-black text-white hover:opacity-90",
    outline: "border bg-transparent hover:bg-gray-50",
    ghost: "bg-transparent hover:bg-gray-50",
    link: "bg-transparent underline-offset-4 hover:underline",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
    default: "h-10 px-4",
    icon: "h-10 w-10 p-0",
    sm: "h-9 px-3",
    lg: "h-11 px-6",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    )
);
Button.displayName = "Button";