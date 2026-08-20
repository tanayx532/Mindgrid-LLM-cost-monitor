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
  if (!data || data.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-slate-700/60 bg-slate-800/60 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Token Usage
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Tokens consumed across API requests
            </p>
          </div>

          <div className="rounded-lg bg-slate-700/50 px-3 py-1.5 text-xs text-slate-400">
            No data
          </div>
        </div>

        <div className="flex h-80 items-center justify-center">
          <div className="text-center">
            <div className="mb-3 text-4xl opacity-50">📊</div>
            <p className="text-sm text-slate-400">
              No usage data available yet
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl border border-slate-700/60 bg-slate-800/70 p-6 shadow-xl backdrop-blur">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-xl">
              📈
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Token Usage
              </h2>

              <p className="text-sm text-slate-400">
                Token consumption per API request
              </p>
            </div>

          </div>
        </div>

        {/* Request count */}
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
              tickMargin={10}
            />

            <YAxis
              stroke="#64748b"
              tick={{
                fill: "#94a3b8",
                fontSize: 12,
              }}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />

            <Tooltip
              cursor={{
                stroke: "#475569",
                strokeWidth: 1,
              }}
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "12px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
              }}
              labelStyle={{
                color: "#94a3b8",
                marginBottom: "4px",
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
                strokeWidth: 0,
                fill: "#22d3ee",
              }}
              activeDot={{
                r: 7,
                stroke: "#0f172a",
                strokeWidth: 3,
                fill: "#22d3ee",
              }}
              animationDuration={800}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-700/50 pt-4">

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
          Total tokens per request
        </div>

        <div className="text-xs text-slate-500">
          Live usage data
        </div>

      </div>

    </div>
  );
}

export default TokenChart;