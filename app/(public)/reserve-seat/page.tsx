import { redirect } from "next/navigation";

// Keep previously shared reservation links working without a payment step.
export default async function ReserveSeatPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const registrationParams = new URLSearchParams();

  for (const key of ["program", "ref"]) {
    const value = params[key];
    if (typeof value === "string") {
      registrationParams.set(key, value);
    }
  }

  const query = registrationParams.toString();
  redirect(query ? `/register?${query}` : "/register");
}
