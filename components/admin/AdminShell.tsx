import AppShell from "@/components/layout/AppShell";

export default function AdminShell({ title, eyebrow, children, action }: { title: string; eyebrow?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <AppShell title={title} eyebrow={eyebrow} action={action} wide>
      {children}
    </AppShell>
  );
}
