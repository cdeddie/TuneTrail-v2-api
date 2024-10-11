import { Track } from "./spotifyCommonTypes";

export type SpotifyRecommendationResponse = {
  tracks: Track[];
  seeds: Seed[];
};

type Seed = {
  initialPoolSize: number;
  afterFilteringSize: number;
  afterRelinkingSize: number;
  id: string;
  type: string;
  href: string;
};