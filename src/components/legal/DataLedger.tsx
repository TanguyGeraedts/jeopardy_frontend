import type { ReactNode } from "react";

export interface LedgerRow {
  what: string;
  detail: ReactNode;
  why: string;
  basis: string;
  kept: string;
}

/** Every kind of personal data the site handles, one row each. On narrow screens each row stacks into a block. */
export function DataLedger({ rows }: { rows: LedgerRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg bg-desk">
      <table className="w-full border-collapse text-left text-sm leading-snug">
        <thead className="sr-only sm:not-sr-only">
          <tr className="border-b-2 border-studio-night text-[13px] text-chalk/60">
            <th scope="col" className="px-4 py-3 font-medium">Data</th>
            <th scope="col" className="px-4 py-3 font-medium">Why</th>
            <th scope="col" className="px-4 py-3 font-medium">Kept for</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.what} className="flex flex-col gap-2 border-b-2 border-studio-night px-4 py-4 last:border-b-0 sm:table-row sm:px-0 sm:py-0">
              <th scope="row" className="align-top font-normal sm:w-[38%] sm:px-4 sm:py-4">
                <span className="block text-[15px] font-semibold text-chalk">{row.what}</span>
                <span className="mt-1 block text-chalk/65">{row.detail}</span>
              </th>
              <td className="align-top text-chalk/85 sm:px-4 sm:py-4">
                {row.why}
                <span className="mt-1 block text-[13px] text-chalk/55">{row.basis}</span>
              </td>
              {/* Retention periods are the ledger's values, so they get the show's gold. */}
              <td className="align-top font-semibold text-gold sm:w-[24%] sm:px-4 sm:py-4">
                <span className="font-normal text-chalk/60 sm:hidden">Kept for </span>
                {row.kept}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
