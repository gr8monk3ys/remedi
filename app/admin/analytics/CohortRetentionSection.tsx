import type { Analytics } from "./analytics.types";
import { CohortHeatCell } from "./CohortHeatCell";

export function CohortRetentionSection({
  cohorts,
}: {
  cohorts: Analytics["cohorts"];
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Cohort Retention (Weekly)
      </h2>
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="py-2 pr-4">Cohort Week</th>
              <th className="py-2 pr-4">Signups</th>
              <th className="py-2 pr-4">W0</th>
              <th className="py-2 pr-4">W1</th>
              <th className="py-2 pr-4">W2</th>
              <th className="py-2 pr-4">W3</th>
              <th className="py-2 pr-4">W4</th>
              <th className="py-2 pr-4">W0 %</th>
              <th className="py-2 pr-4">W1 %</th>
              <th className="py-2 pr-4">W2 %</th>
              <th className="py-2 pr-4">W3 %</th>
              <th className="py-2">W4 %</th>
            </tr>
          </thead>
          <tbody>
            {cohorts.length === 0 ? (
              <tr>
                <td className="py-4 text-muted-foreground" colSpan={12}>
                  No cohort data yet.
                </td>
              </tr>
            ) : (
              cohorts.map((row) => (
                <tr
                  key={row.weekStart}
                  className="border-b border-border last:border-0 text-foreground"
                >
                  <td className="py-2 pr-4 font-mono text-xs">
                    {row.weekStart}
                  </td>
                  <td className="py-2 pr-4">{row.signups}</td>
                  <td className="py-2 pr-4">{row.week0}</td>
                  <td className="py-2 pr-4">{row.week1}</td>
                  <td className="py-2 pr-4">{row.week2}</td>
                  <td className="py-2 pr-4">{row.week3}</td>
                  <td className="py-2 pr-4">{row.week4}</td>
                  <td className="py-2 pr-4">
                    <CohortHeatCell percent={row.week0Pct} />
                  </td>
                  <td className="py-2 pr-4">
                    <CohortHeatCell percent={row.week1Pct} />
                  </td>
                  <td className="py-2 pr-4">
                    <CohortHeatCell percent={row.week2Pct} />
                  </td>
                  <td className="py-2 pr-4">
                    <CohortHeatCell percent={row.week3Pct} />
                  </td>
                  <td className="py-2">
                    <CohortHeatCell percent={row.week4Pct} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
