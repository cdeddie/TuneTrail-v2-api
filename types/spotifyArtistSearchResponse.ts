import { Image, ExternalUrls } from "./spotifyCommonTypes";

export type SpotifyArtistSearchResponse = {
  href: string;
  items: Item[];
  limit: number;
  next: string;
  offset: number;
  previous: any;
  total: number;
};

export interface Item {
  external_urls: ExternalUrls;
  followers: Followers;
  genres: string[];
  href: string;
  id: string;
  images: Image[];
  name: string;
  popularity: number;
  type: string;
  uri: string;
};

type Followers = {
  href: any;
  total: number;
};