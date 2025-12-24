"use client";
import { useState } from "react";
import { Search, GitBranch, FileCode, Download, CheckCircle, AlertCircle } from "lucide-react";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("formatted");

  async function analyzeRepo() {
    if (!repoUrl.trim()) {
      setError("Please enter a repository URL");
      return;
    }

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repoUrl }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze repository");
    } finally {
      setLoading(false);
    }
  }

  function downloadJSON() {
    if (!result) return;
    
    const blob = new Blob([JSON.stringify(result.components, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GitBranch className="w-12 h-12 text-purple-400" />
            <h1 className="text-5xl font-bold text-white">CodeIQ</h1>
          </div>
          <p className="text-xl text-purple-200">
            AI-Powered Repository Dependency Analyzer
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 shadow-2xl border border-white/20">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Enter GitHub Repository URL (e.g., https://github.com/user/repo)"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && analyzeRepo()}
                  className="w-full pl-12 pr-4 py-4 bg-white/20 border border-purple-300/30 rounded-xl text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>
              <button
                onClick={analyzeRepo}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </span>
                ) : (
                  "Analyze"
                )}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white mb-1">
                  {result.stats.total_components}
                </div>
                <div className="text-purple-200 text-sm">Total Components</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white mb-1">
                  {result.stats.functions}
                </div>
                <div className="text-blue-200 text-sm">Functions</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white mb-1">
                  {result.stats.classes}
                </div>
                <div className="text-green-200 text-sm">Classes</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white mb-1">
                  {result.stats.methods}
                </div>
                <div className="text-orange-200 text-sm">Methods</div>
              </div>
            </div>

            {/* Success Message */}
            <div className="flex items-center justify-between bg-green-500/20 border border-green-500/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-200">
                <CheckCircle className="w-5 h-5" />
                <span>{result.message}</span>
              </div>
              <button
                onClick={downloadJSON}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition"
              >
                <Download className="w-4 h-4" />
                Download JSON
              </button>
            </div>

            {/* Tabs */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
              <div className="flex border-b border-white/20">
                <button
                  onClick={() => setActiveTab("formatted")}
                  className={`flex-1 px-6 py-4 font-semibold transition ${
                    activeTab === "formatted"
                      ? "bg-purple-600 text-white"
                      : "text-purple-200 hover:bg-white/5"
                  }`}
                >
                  <FileCode className="inline w-5 h-5 mr-2" />
                  Formatted Output
                </button>
                <button
                  onClick={() => setActiveTab("components")}
                  className={`flex-1 px-6 py-4 font-semibold transition ${
                    activeTab === "components"
                      ? "bg-purple-600 text-white"
                      : "text-purple-200 hover:bg-white/5"
                  }`}
                >
                  Components
                </button>
                <button
                  onClick={() => setActiveTab("dag")}
                  className={`flex-1 px-6 py-4 font-semibold transition ${
                    activeTab === "dag"
                      ? "bg-purple-600 text-white"
                      : "text-purple-200 hover:bg-white/5"
                  }`}
                >
                  DAG
                </button>
                <button
                  onClick={() => setActiveTab("stats")}
                  className={`flex-1 px-6 py-4 font-semibold transition ${
                    activeTab === "stats"
                      ? "bg-purple-600 text-white"
                      : "text-purple-200 hover:bg-white/5"
                  }`}
                >
                  Statistics
                </button>
              </div>

              <div className="p-6 max-h-[600px] overflow-y-auto">
                {activeTab === "formatted" && (
                  <pre className="text-purple-100 text-sm font-mono whitespace-pre-wrap">
                    {result.formatted_output}
                  </pre>
                )}

                {activeTab === "components" && (
                  <div className="space-y-4">
                    {Object.entries(result.components).map(([id, comp]: [string, any]) => (
                      <div
                        key={id}
                        className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-purple-500/50 transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-mono text-purple-300 font-semibold">
                            {id}
                          </div>
                          <span className="px-3 py-1 bg-purple-500/30 rounded-full text-xs text-purple-200">
                            {comp.type}
                          </span>
                        </div>
                        <div className="text-sm text-purple-200/70 mb-2">
                          {comp.file_path}
                        </div>
                        {comp.depends_on && comp.depends_on.length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs text-purple-300 mb-1">Dependencies:</div>
                            <div className="flex flex-wrap gap-2">
                              {comp.depends_on.map((dep: string) => (
                                <span
                                  key={dep}
                                  className="px-2 py-1 bg-purple-600/30 rounded text-xs text-purple-200"
                                >
                                  {dep}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "dag" && (
                  <div className="space-y-3">
                    {Object.entries(result.dag)
                      .filter(([_, deps]) => (deps as any[]).length > 0)
                      .map(([id, deps]) => (
                        <div
                          key={id}
                          className="bg-white/5 rounded-lg p-4 border border-white/10"
                        >
                          <div className="font-mono text-purple-300 mb-2">{id}</div>
                          <div className="flex items-center gap-2 text-purple-200/70">
                            <span>→</span>
                            <div className="flex flex-wrap gap-2">
                              {(deps as string[]).map((dep) => (
                                <span
                                  key={dep}
                                  className="px-2 py-1 bg-purple-600/30 rounded text-xs"
                                >
                                  {dep}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {activeTab === "stats" && (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(result.stats).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-white/5 rounded-lg p-4 border border-white/10"
                      >
                        <div className="text-2xl font-bold text-white mb-1">
                          {typeof value === "number" ? value.toLocaleString() : value}
                        </div>
                        <div className="text-purple-200 text-sm capitalize">
                          {key.replace(/_/g, " ")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}