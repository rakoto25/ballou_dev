import * as React from "react";

function cn(...cls: Array<string | undefined | null | false>) {
    return cls.filter(Boolean).join(" ");
}

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("rounded-2xl border bg-white shadow-sm", props.className)} {...props} />;
}
export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-3", props.className)} {...props} />;
}
export function CardTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn("text-base font-semibold leading-none tracking-tight", props.className)} {...props} />;
}
export function CardContent(props: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-3", props.className)} {...props} />;
}
export function CardFooter(props: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-3 pt-0", props.className)} {...props} />;
}