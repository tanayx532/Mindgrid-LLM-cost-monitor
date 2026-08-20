import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import StatCard from "./components/StatCard";
import PromptBox from "./components/PromptBox";
import TokenChart from "./components/TokenChart";

const API = "http://127.0.0.1:8000";

function App() {
  const [stats, setStats] = useState({
    total_requests: 0,
    total_tokens: 0,
    average_latency_ms: 0,
    anomaly_count: 0,
  });

  const [cost, setCost] = useState({
    total_cost: 0,
  });

  const [usageHistory, setUsageHistory] = useState([]);

  const [anomaly, setAnomaly] = useState(false);

  // -----------------------------
  // Fetch Dashboard
  // -----------------------------
  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API}/dashboard`);

      if (!res.ok) {
        throw new Error("Dashboard request failed");
      }

      const data = await res.json();

      setStats(data);
      setAnomaly(Number(data.anomaly_count) > 0);
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  };

  // -----------------------------
  // Fetch Cost
  // -----------------------------
  const fetchCost = async () => {
    try {
      const res = await fetch(`${API}/cost`);

      if (!res.ok) {
        throw new Error("Cost request failed");
      }

      const data = await res.json();

      setCost(data);
    } catch (error) {
      console.error("Cost error:", error);
    }
  };

  // -----------------------------
  // Fetch Token History
  // -----------------------------
  const fetchUsageHistory = async () => {
    try {
      const res = await fetch(`${API}/usage-history`);

      if (!res.ok) {
        throw new Error("Usage history request failed");
      }

      const data = await res.json();

      setUsageHistory(data);
    } catch (error) {
      console.error("Usage history error:", error);
    }
  };

  // -----------------------------
  // Refresh Everything
  // -----------------------------
  const refreshDashboard = async () => {
    await Promise.all([
      fetchDashboard(),
      fetchCost(),
      fetchUsageHistory(),
    ]);
  };

  // -----------------------------
  // Initial Load
  // -----------------------------
  useEffect(() => {
    refreshDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-[#070b14] text-white">

      <Navbar />

      {/* MAIN CONTAINER */}

      <main className="mx-auto max-w-[1600px] px-6 py-8 lg:px-10">

        {/* ========================= */}
        {/* PAGE HEADER */}
        {/* ========================= */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2">

              <span className="text-sm font-medium text-cyan-400">
                MINDGRID
              </span>

              <span className="text-slate-600">
                /
              </span>

              <span className="text-sm text-slate-500">
                LLM Observability
              </span>

            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Monitor your AI infrastructure, token usage and API costs.
            </p>

          </div>

          {/* System Status */}

          <div className="flex items-center gap-3">

            <div className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-800/50 px-4 py-3">

              <span className="relative flex h-2.5 w-2.5">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>

                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400"></span>

              </span>

              <div>

                <p className="text-xs font-medium text-slate-400">
                  System Status
                </p>

                <p className="text-sm font-semibold text-emerald-400">
                  Operational
                </p>

              </div>

            </div>

            <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 px-4 py-3">

              <p className="text-xs text-slate-500">
                Active Model
              </p>

              <p className="text-sm font-medium text-slate-200">
                GPT-4.1 Mini
              </p>

            </div>

          </div>

        </div>


        {/* ========================= */}
        {/* ANOMALY ALERT */}
        {/* ========================= */}

        {anomaly && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-red-500/30 bg-red-500/[0.06]">

            <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-xl">
                  🚨
                </div>

                <div>

                  <div className="flex items-center gap-3">

                    <h2 className="font-semibold text-red-400">
                      Anomaly Detected
                    </h2>

                    <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
                      Attention Required
                    </span>

                  </div>

                  <p className="mt-1 text-sm text-slate-400">
                    {stats.anomaly_count} unusually high-token request
                    {stats.anomaly_count !== 1 ? "s" : ""} detected.
                  </p>

                </div>

              </div>

              <div className="text-sm text-red-400">
                Review usage →
              </div>

            </div>

          </div>
        )}


        {/* ========================= */}
        {/* OVERVIEW */}
        {/* ========================= */}

        <div className="mb-4 flex items-center justify-between">

          <div>

            <h2 className="text-lg font-semibold text-white">
              Overview
            </h2>

            <p className="text-sm text-slate-500">
              Current API usage metrics
            </p>

          </div>

          <div className="hidden text-xs text-slate-500 md:block">
            Live monitoring
          </div>

        </div>


        {/* ========================= */}
        {/* STAT CARDS */}
        {/* ========================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <StatCard
            title="Total Requests"
            value={stats.total_requests}
          />

          <StatCard
            title="Total Tokens"
            value={Number(stats.total_tokens).toLocaleString()}
          />

          <StatCard
            title="Total Cost"
            value={`$${Number(cost.total_cost).toFixed(6)}`}
          />

          <StatCard
            title="Anomalies"
            value={stats.anomaly_count}
          />

          <StatCard
            title="Average Latency"
            value={`${stats.average_latency_ms} ms`}
          />

        </div>


        {/* ========================= */}
        {/* TOKEN ANALYTICS */}
        {/* ========================= */}

        <div className="mt-10">

          <div className="mb-4">

            <h2 className="text-lg font-semibold text-white">
              Usage Analytics
            </h2>

            <p className="text-sm text-slate-500">
              Track token consumption across your requests.
            </p>

          </div>

          <TokenChart data={usageHistory} />

        </div>


        {/* ========================= */}
        {/* ASK AI */}
        {/* ========================= */}

        <div className="mt-10">

          <div className="mb-4">

            <h2 className="text-lg font-semibold text-white">
              AI Playground
            </h2>

            <p className="text-sm text-slate-500">
              Send a request and instantly monitor its usage.
            </p>

          </div>

          <PromptBox
            onRequestComplete={refreshDashboard}
          />

        </div>


        {/* ========================= */}
        {/* FOOTER */}
        {/* ========================= */}

        <div className="mt-10 border-t border-slate-800 pt-5">

          <div className="flex flex-col justify-between gap-2 text-xs text-slate-600 md:flex-row">

            <p>
              MindGrid LLM Cost Monitor
            </p>

            <p>
              Monitoring OpenAI API usage
            </p>

          </div>

        </div>

      </main>

    </div>
  );
}

export default App;