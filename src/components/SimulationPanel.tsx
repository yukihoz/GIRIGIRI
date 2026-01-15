"use client";

import { Candidate } from "@/types/election";
import { useState } from "react";
import { VoteBar } from "./VoteBar";
import { calculateWinner, calculateFlipThreshold, getRunnerUp } from "@/lib/simulation";
import { RefreshCcw, ArrowRightLeft, ExternalLink } from "lucide-react";

interface SimulationPanelProps {
    initialCandidates: Candidate[];
    districtName: string;
    selectedParty?: string;
}

export const SimulationPanel = ({ initialCandidates, districtName, selectedParty }: SimulationPanelProps) => {
    // Static display - no adjustments
    const currentCandidates = initialCandidates;

    // Calculate stats
    const winner = calculateWinner(currentCandidates);
    const maxVotes = winner ? winner.votes : 100;

    // Determine target for comparison based on selected party
    let comparisonRef: Candidate | null | undefined = getRunnerUp(currentCandidates);
    let comparisonNote = "";

    // If a specific party is selected
    if (selectedParty && selectedParty !== "ALL") {
        const partyCandidate = currentCandidates.find(c => c.party === selectedParty);

        if (partyCandidate) {
            // Case A: The selected party is the winner
            if (winner && partyCandidate.id === winner.id) {
                comparisonRef = undefined; // No "flip" needed, they won
                comparisonNote = "当選";
            }
            // Case B: The selected party lost
            else {
                comparisonRef = partyCandidate;
                comparisonNote = "あと";
            }
        }
    }

    // Calculate margin if we have a comparison target (who is losing)
    const marginToFlip = (winner && comparisonRef)
        ? calculateFlipThreshold(winner.votes, comparisonRef.votes)
        : 0;

    // Format district name for Wikipedia and Title
    // e.g. "東京1区" -> "東京都第1区", "愛知10区" -> "愛知県第10区"
    const formatDistrictName = (name: string) => {
        // Normalize full-width numbers to half-width just in case
        const normalized = name.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));

        const match = normalized.match(/^(.+?)(\d+)区$/);
        if (!match) return name; // Fallback

        const [, rawPref, num] = match;
        let pref = rawPref.trim();

        // Handle prefecture suffixes
        if (pref === "東京") pref = "東京都";
        else if (pref === "大阪") pref = "大阪府";
        else if (pref === "京都") pref = "京都府";
        else if (pref === "北海道") pref = "北海道";
        else if (!pref.endsWith("県") && !pref.endsWith("府") && !pref.endsWith("都") && !pref.endsWith("道")) {
            pref = pref + "県";
        }

        return `${pref}第${num}区`;
    };

    const formattedName = formatDistrictName(districtName);
    const wikiUrl = `https://ja.wikipedia.org/wiki/${formattedName}`;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800">{formattedName}</h3>
            </div>

            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">当選者</span>
                    {winner && (
                        <span className="px-2 py-1 rounded text-sm font-bold bg-blue-50 text-blue-700">
                            {winner.name} ({winner.party})
                        </span>
                    )}
                </div>

                {/* Show comparison if applicable */}
                {winner && comparisonRef && (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                        <ArrowRightLeft size={12} />
                        <span>
                            {comparisonRef.party}（{comparisonRef.name}）は{comparisonNote} <strong>{marginToFlip.toLocaleString()}</strong> 票で逆転
                        </span>
                    </div>
                )}

                {/* Show victory message if selected party won */}
                {comparisonNote === "当選" && (
                    <div className="text-xs text-green-600 flex items-center gap-1 font-bold">
                        <span>🎉 {selectedParty}候補が当選しています</span>
                    </div>
                )}
            </div>

            <div className="space-y-4 mb-6">
                {currentCandidates.map(c => (
                    <div key={c.id}>
                        <VoteBar candidate={c} maxVotesInRace={maxVotes} totalVotes={0} />
                    </div>
                ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
                <a
                    href={wikiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors"
                >
                    <ExternalLink size={12} />
                    <span>Wikipediaで見る</span>
                </a>
            </div>
        </div>
    );
};
