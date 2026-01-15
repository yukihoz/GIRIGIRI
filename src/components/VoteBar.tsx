import { Candidate } from "@/types/election";
import { cn } from "@/lib/utils";

interface VoteBarProps {
    candidate: Candidate;
    totalVotes: number; // Keep for interface consistency even if not used yet
    maxVotesInRace: number;
    color?: string;
}

export const PARTY_COLORS: Record<string, string> = {
    "自民": "#e70112",
    "立民": "#024197",
    "国民": "#fbbe00",
    "公明": "#f55881",
    "維新": "#badc58",
    "れいわ": "#e4027e",
    "共産": "#9b59b6",
    "参政": "#F6661F",
    "保守": "#0982DC",
    "社民": "#3d9be7",
    "教育": "#37c200",
    "みんつく": "#01afa2",
    "みらい": "#73d7c3",
    // Fallbacks
    "無所属": "#9ca3af",
};

export const VoteBar = ({ candidate, maxVotesInRace }: VoteBarProps) => {
    const percentage = maxVotesInRace > 0 ? (candidate.votes / maxVotesInRace) * 100 : 0;
    const displayName = candidate.name.length > 8 ? candidate.name.slice(0, 8) : candidate.name;
    const color = PARTY_COLORS[candidate.party] || "#9ca3af";

    return (
        <div className="flex items-center gap-2 text-sm my-1">
            <div className="w-28 shrink-0 font-medium text-gray-900" title={candidate.name}>
                {displayName}
            </div>
            <div className="w-20 shrink-0 flex justify-center">
                <span
                    className="text-[10px] text-white px-2 py-0.5 rounded-full font-bold whitespace-nowrap shadow-sm"
                    style={{ backgroundColor: color }}
                >
                    {candidate.party}
                </span>
            </div>
            <div className="w-32 h-4 bg-gray-100 rounded-full overflow-hidden relative">
                <div
                    className={cn("h-full transition-all duration-300")}
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: color
                    }}
                />
            </div>
            <div className="w-16 shrink-0 text-right font-mono text-gray-700">
                {candidate.votes.toLocaleString()}
            </div>
        </div>
    );
};
