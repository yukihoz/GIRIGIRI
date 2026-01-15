import { Candidate } from "@/types/election";

export function getSortedCandidates(candidates: Candidate[]) {
    return [...candidates].sort((a, b) => b.votes - a.votes);
}

export function calculateWinner(candidates: Candidate[]) {
    const sorted = getSortedCandidates(candidates);
    return sorted.length > 0 ? sorted[0] : null;
}

export function calculateMargin(candidates: Candidate[]) {
    const sorted = getSortedCandidates(candidates);
    if (sorted.length < 2) return sorted[0] ? sorted[0].votes : 0;
    return sorted[0].votes - sorted[1].votes;
}

export function getRunnerUp(candidates: Candidate[]) {
    const sorted = getSortedCandidates(candidates);
    return sorted.length > 1 ? sorted[1] : null;
}

export function calculateFlipThreshold(winnerVotes: number, runnerUpVotes: number) {
    const margin = winnerVotes - runnerUpVotes;
    if (margin < 0) return 0; // Already flipped
    return Math.floor(margin / 2) + 1;
}
