import DataTableCompany from "./_components/table"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams

  return (
    <main className="">
      <DataTableCompany searchParams={params} />
    </main>
  )
}