import { Panda } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4">
        <Panda className="size-10 shrink-0" strokeWidth={1}/>
        <h1 className="text-2xl font-medium">Panda CRM</h1>
        <p className="text-sm text-muted-foreground">
          Panda CRM is a tool that helps you manage your customers.
        </p>
      {children}
    </main>
  );
}
