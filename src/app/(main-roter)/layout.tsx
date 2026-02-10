export default async function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="_full flex h-screen ">
            <div className="w-96 h-full bg-red-200">aside</div>
            <div className="grow flex children_container relative">{children}</div>
        </div>
    );
}
