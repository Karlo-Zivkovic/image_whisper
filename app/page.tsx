import ClientQueryList from "@/lib/components/ClientQueryList";

export default function Home() {
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Client Images & Queries</h1>
      <ClientQueryList />
    </main>
  );
}
