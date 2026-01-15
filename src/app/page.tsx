"use client";

import { useState, useMemo, useEffect } from "react";
import rawData from "@/data/election_results_2024.json";
import { District } from "@/types/election";
import { DistrictCard } from "@/components/DistrictCard";
import { SimulationPanel } from "@/components/SimulationPanel";
import { getSortedCandidates } from "@/lib/simulation";
import { Search, Filter, Github, X, Users, ArrowUpDown, BarChart2, TrendingDown } from "lucide-react";
import { PARTY_COLORS } from "@/components/VoteBar";

// Cast raw json to typed data
const allDistricts = rawData as District[];

// Extract all unique parties from the dataset
const allParties = Array.from(new Set(
  allDistricts.flatMap(d => d.candidates.map(c => c.party))
)).sort();

export default function Home() {
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(allDistricts[0]?.id || "");
  const [maxMargin, setMaxMargin] = useState<number | "">(5000); // Default filter to 5000 votes
  const [selectedParty, setSelectedParty] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredDistricts = useMemo(() => {
    return allDistricts.filter(d => {
      // 1. Filter by Margin
      const marginCondition = maxMargin === "" || d.margin <= maxMargin;

      // 2. Filter by Party (Show district only if the selected party is 2nd/Runner-up)
      let partyCondition = selectedParty === "ALL";
      if (!partyCondition) {
        // Sort candidates by votes to identify Top 2
        // optimizing: assuming d.candidates might not be sorted by votes in raw data
        const sorted = [...d.candidates].sort((a, b) => b.votes - a.votes);
        const rank2 = sorted[1];

        // Strict: The selected party MUST be the runner-up (Rank 2)
        // This implicitly excludes them if they won (Rank 1) or are 3rd+
        partyCondition = (rank2?.party === selectedParty);
      }

      return marginCondition && partyCondition;
    }).sort((a, b) => {
      // Sort by margin
      if (sortOrder === "asc") {
        return a.margin - b.margin; // Small margin first (Ascending)
      } else {
        return b.margin - a.margin; // Large margin first (Descending)
      }
    });
  }, [maxMargin, selectedParty, sortOrder]);

  // If selected district is filtered out, select the first visible one
  useEffect(() => {
    if (selectedDistrictId !== "" && filteredDistricts.length > 0 && !filteredDistricts.find(d => d.id === selectedDistrictId)) {
      if (filteredDistricts[0]) {
        setSelectedDistrictId(filteredDistricts[0].id);
      }
    }
  }, [filteredDistricts, selectedDistrictId]);

  const selectedDistrict = allDistricts.find(d => d.id === selectedDistrictId);

  // Calculate stats for "Close Race" (Rank 2) counts when NO party is selected
  // We want to know: "In how many districts is [Party] the runner-up loser?"
  const closeRaceStats = useMemo(() => {
    if (selectedParty !== "ALL") return [];

    const stats: Record<string, number> = {};
    // Use filteredDistricts (by margin) to show relevant stats for current margin
    filteredDistricts.forEach(d => {
      const sorted = [...d.candidates].sort((a, b) => b.votes - a.votes);
      const runnerUp = sorted[1];
      if (runnerUp) {
        stats[runnerUp.party] = (stats[runnerUp.party] || 0) + 1;
      }
    });

    return Object.entries(stats)
      .sort(([, a], [, b]) => b - a) // Sort by count desc
      .map(([party, count]) => ({ party, count }));
  }, [selectedParty, filteredDistricts]);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-black tracking-tighter text-blue-900 flex items-center gap-2">
            <TrendingDown className="w-8 h-8 text-blue-600" />
            <span className="text-2xl">惜敗分析（衆院選2024）</span>
          </h1>
          <div className="text-xs text-gray-500 font-medium hidden sm:block">
            Beta V0.4 (Real Data)
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Sidebar: District List & Filter */}
        <div className="lg:col-span-4 space-y-4 h-[calc(100vh-8rem)] flex flex-col">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">

            {/* Margin Filter */}
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Filter size={16} />
                <span>絞り込み (票差)</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="例: 5000"
                  value={maxMargin}
                  onChange={(e) => setMaxMargin(e.target.value === "" ? "" : parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 whitespace-nowrap">票以下の接戦区</span>
              </div>
            </div>

            {/* Party Filter (Buttons) */}
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Users size={16} />
                <span>絞り込み (惜敗した政党)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedParty("ALL")}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-bold transition-all border
                    ${selectedParty === "ALL"
                      ? "bg-gray-800 text-white border-gray-800 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"}
                  `}
                >
                  全て
                </button>
                {allParties.map(party => {
                  const isActive = selectedParty === party;
                  const color = PARTY_COLORS[party] || "#9ca3af";
                  return (
                    <button
                      key={party}
                      onClick={() => setSelectedParty(party)}
                      className={`
                        px-3 py-1.5 rounded-full text-xs font-bold transition-all border
                      `}
                      style={{
                        backgroundColor: isActive ? color : "white",
                        color: isActive ? "white" : "#4b5563",
                        borderColor: isActive ? color : "#e5e7eb",
                        opacity: (isActive || selectedParty === "ALL") ? 1 : 0.6
                      }}
                    >
                      {party}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stats Graph (Only visible when ALL is selected) */}
            {selectedParty === "ALL" && closeRaceStats.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-2">
                  <BarChart2 size={14} />
                  <span>政党別 惜敗数 (現在の票差内)</span>
                </div>
                <div className="space-y-1.5">
                  {closeRaceStats.slice(0, 5).map(({ party, count }) => { // Show top 5
                    const color = PARTY_COLORS[party] || "#9ca3af";
                    const maxCount = closeRaceStats[0].count;
                    const width = (count / maxCount) * 100;

                    return (
                      <div
                        key={party}
                        className="flex items-center gap-2 text-xs cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedParty(party)}
                      >
                        <span className="w-12 text-right font-medium shrink-0 text-gray-600">{party}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${width}%`, backgroundColor: color }}
                          />
                        </div>
                        <span className="w-6 text-right font-mono text-gray-500">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="font-bold text-gray-700">選挙区一覧</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                title={sortOrder === "asc" ? "票差の小さい順 (昇順)" : "票差の大きい順 (降順)"}
              >
                <ArrowUpDown size={12} />
                <span>{sortOrder === "asc" ? "接戦順" : "票差順"}</span>
              </button>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-600">
                {filteredDistricts.length} 件
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin space-y-3">
            {filteredDistricts.length > 0 ? (
              filteredDistricts.map((d) => (
                <DistrictCard
                  key={d.id}
                  district={d}
                  isSelected={d.id === selectedDistrictId}
                  onClick={() => setSelectedDistrictId(d.id)}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                条件に一致する選挙区はありません
              </div>
            )}
          </div>
        </div>

        {/* Right Content: Simulation Area */}
        <div className="lg:col-span-8">
          <div className="mb-4">
            <h2 className="text-sm uppercase tracking-wide text-gray-400 font-bold mb-1">
              分析 & シミュレーション
            </h2>
            <p className="text-sm text-gray-600">
              票数を調整して、当落がどのように変わるか確認できます。
            </p>
          </div>

          {/* Right Panel: Simulation/Details */}
          <div className={`
            fixed inset-0 z-50 flex flex-col justify-end pointer-events-none
            md:static md:block md:z-auto md:bg-transparent
          `}>
            {/* Mobile Backdrop */}
            {selectedDistrict && (
              <div
                className="absolute inset-0 bg-black/50 pointer-events-auto md:hidden"
                onClick={() => setSelectedDistrictId("")}
              />
            )}

            {/* Panel Content */}
            <div className={`
              w-full bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] 
              pointer-events-auto transition-transform duration-300 transform
              ${selectedDistrict ? "translate-y-0" : "translate-y-full"}
              md:transform-none md:shadow-none md:rounded-none md:bg-transparent md:block
            `}>
              {selectedDistrict ? (
                <div className="relative">
                  {/* Mobile Close Handle/Indicator */}
                  <div className="flex justify-center pt-3 pb-1 md:hidden">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedDistrictId("")}
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors z-10"
                    title="閉じる"
                  >
                    <X size={20} />
                  </button>

                  <SimulationPanel
                    key={selectedDistrict.id} // Re-mount when district changes to reset state
                    initialCandidates={getSortedCandidates(selectedDistrict.candidates)}
                    districtName={selectedDistrict.name}
                    selectedParty={selectedParty}
                  />
                </div>
              ) : (
                <div className="hidden md:flex h-64 items-center justify-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <p>左のリストから選挙区を選択してください</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
