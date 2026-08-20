import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function TokenChart({ data }) {
  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-6 shadow-xl">

        <div className="flex items-center justify-between">

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-lg">
                📈
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Token Usage
                </h2>

                <p className="text-sm text-slate-400">
                  Token consumption across API requests
                </p>
              </div>
            </div>
          </div>

          <span className="rounded-lg bg-slate-700/60 px-3 py-1.5 text-xs text-slate-400">
            Waiting for data
          </span>

        </div>

        <div className="mt-6 flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/30">

          <div className="text-center">

            <div className="mb-3 text-3xl opacity-60">
              📊
            </div>

            <p className="text-sm font-medium text-slate-300">
              No usage data yet
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Send an AI request to populate this chart.
            </p>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/70 p-6 shadow-xl">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-lg">
            📈
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">
              Token Usage
            </h2>

            <p className="text-sm text-slate-400">
              Token consumption across API requests
            </p>
          </div>

        </div>

        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-right">

          <p className="text-xs text-slate-400">
            Requests
          </p>

          <p className="text-lg font-semibold text-cyan-400">
            {data.length}
          </p>

        </div>

      </div>

      {/* Chart */}
      <div className="h-[350px] w-full">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 20,
              left: 5,
              bottom: 10,
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              vertical={false}
            />

            <XAxis
              dataKey="id"
              stroke="#64748b"
              tick={{
                fill: "#94a3b8",
                fontSize: 12,
              }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              stroke="#64748b"
              tick={{
                fill: "#94a3b8",
                fontSize: 12,
              }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "12px",
              }}
              labelStyle={{
                color: "#94a3b8",
              }}
              itemStyle={{
                color: "#22d3ee",
              }}
              labelFormatter={(id) => `Request #${id}`}
              formatter={(value) => [
                `${Number(value).toLocaleString()} tokens`,
                "Usage",
              ]}
            />

            <Line
              type="monotone"
              dataKey="total_tokens"
              stroke="#22d3ee"
              strokeWidth={3}
              dot={{
                r: 3,
                fill: "#22d3ee",
                strokeWidth: 0,
              }}
              activeDot={{
                r: 7,
              }}
              animationDuration={800}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-700/50 pt-4">

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          Total tokens per request
        </div>

        <span className="text-xs text-slate-500">
          Live data
        </span>

      </div>

    </div>
  );
}

export default TokenChart;