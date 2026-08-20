import { useState } from "react";

function PromptBox({ onRequestComplete }) {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
        }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = await res.json();

      setResponse(data.reply);

      setPrompt("");

      if (onRequestComplete) {
        await onRequestComplete();
      }

    } catch (error) {
      console.error(error);
      setResponse(
        "Unable to connect to the AI backend."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 mt-8 shadow-xl">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">

        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <span className="text-xl">
            ✨
          </span>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">
            Ask AI
          </h2>

          <p className="text-sm text-slate-400">
            Send a request and monitor its usage
          </p>
        </div>

      </div>

      {/* Input area */}
      <div className="relative">

        <textarea
          placeholder="Ask something..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey
            ) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={4}
          disabled={loading}
          className="w-full resize-none p-4 pr-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
        />

        <div className="flex justify-between items-center mt-4">

          <p className="text-xs text-slate-500">
            Press Enter to send • Shift + Enter for a new line
          </p>

          <button
            onClick={handleSend}
            disabled={loading || !prompt.trim()}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
              loading || !prompt.trim()
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-cyan-500 text-slate-950 hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : (
              "Send →"
            )}
          </button>

        </div>

      </div>

      {/* AI Response */}
      {response && (
        <div className="mt-6 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden">

          <div className="px-5 py-3 border-b border-slate-700 flex items-center gap-2">

            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>

            <h3 className="font-medium text-slate-200">
              AI Response
            </h3>

          </div>

          <div className="p-5 text-slate-300 leading-relaxed whitespace-pre-wrap">
            {response}
          </div>

        </div>
      )}

    </div>
  );
}

export default PromptBox;