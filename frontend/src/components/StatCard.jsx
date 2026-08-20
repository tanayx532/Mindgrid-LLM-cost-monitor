function StatCard({ title, value }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/70 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-600 hover:shadow-2xl">

      {/* Subtle glow */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-500/5 blur-2xl transition-all duration-300 group-hover:bg-cyan-500/10" />

      {/* Content */}
      <div className="relative">

        {/* Header */}
        <div className="flex items-center justify-between">

          <p className="text-sm font-medium text-slate-400">
            {title}
          </p>

          <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/40" />

        </div>

        {/* Value */}
        <p className="mt-3 text-3xl font-bold tracking-tight text-white">
          {value}
        </p>

        {/* Bottom indicator */}
        <div className="mt-4 flex items-center gap-2">

          <div className="h-1 w-8 rounded-full bg-cyan-400" />

          <div className="h-1 w-2 rounded-full bg-slate-600" />

          <div className="h-1 w-2 rounded-full bg-slate-700" />

        </div>

      </div>

    </div>
  );
}

export default StatCard;