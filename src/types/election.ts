export type Candidate = {
  id: string;
  name: string;
  party: string;
  votes: number;
  is_winner: boolean;
};

export type District = {
  id: string;
  prefecture: string;
  name: string; // e.g., "District 1"
  candidates: Candidate[];
  margin: number; // calculated as abs(winner_votes - runner_up_votes)
  total_votes: number;
};
