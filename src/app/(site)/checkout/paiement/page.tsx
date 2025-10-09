import PayClient from "./PayClient";

export default function Page({ searchParams }: { searchParams: any }) {
    const { order, key, method } = searchParams;
    return <PayClient orderId={Number(order)} orderKey={String(key)} method={String(method)} />;
}