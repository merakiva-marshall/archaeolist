import AdminClientLayout from "./AdminClientLayout";

export const dynamic = "force-dynamic";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminClientLayout>{children}</AdminClientLayout>;
}
