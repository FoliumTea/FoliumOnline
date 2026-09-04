export const revalidate = false;
export const dynamic = "force-static";

export async function generateStaticParams() {
    return [];
}

export default function JobFieldLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return children;
}
