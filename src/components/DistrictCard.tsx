import { District } from "@/types/election";
import { calculateWinner } from "@/lib/simulation";
import { PARTY_COLORS } from "./VoteBar";

interface DistrictCardProps {
    district: District;
    onClick: () => void;
    isSelected?: boolean;
}

export const DistrictCard = ({ district, onClick, isSelected }: DistrictCardProps) => {
    const winner = calculateWinner(district.candidates);

    return (
        <div
            onClick={onClick}
            className={`
        p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md
        ${isSelected ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/20" : "border-gray-200 bg-white"}
      `}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="font-bold text-gray-900">{district.name}</h4>
                    <p className="text-xs text-gray-500">{district.prefecture}</p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-400">票差</div>
                    <div className={`font-mono font-bold ${district.margin < 5000 ? "text-red-600" : "text-gray-700"}`}>
                        {district.margin.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                {/* Show top 2 candidates for compactness in list view */}
                {district.candidates.slice(0, 2).map((c) => {
                    const color = PARTY_COLORS[c.party] || "#9ca3af";
                    return (
                        <div key={c.id} className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <span className={`${c.id === winner?.id ? "font-bold text-gray-800" : "text-gray-500"} truncate max-w-[80px]`}>
                                    {c.name}
                                </span>
                                <span
                                    className="text-[9px] text-white px-1.5 py-px rounded-full font-bold whitespace-nowrap shrink-0"
                                    style={{ backgroundColor: color }}
                                >
                                    {c.party}
                                </span>
                            </div>
                            <span className="text-gray-400 shrink-0 ml-2">{c.votes.toLocaleString()}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
