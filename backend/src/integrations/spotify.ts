import axios, { AxiosInstance } from 'axios';
import { config } from '../config';

interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyArtist {
  id: string;
  name: string;
  popularity: number;
  followers: {
    total: number;
  };
  genres: string[];
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  external_urls: {
    spotify: string;
  };
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: {
    id: string;
    name: string;
    release_date: string;
  };
}

interface AudioFeatures {
  id: string;
  tempo: number;
  energy: number;
  danceability: number;
  valence: number;
  loudness: number;
  acousticness: number;
  instrumentalness: number;
  speechiness: number;
  duration_ms: number;
}

export class SpotifyClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.spotify.com/v1',
    });

    this.client.interceptors.request.use(async (config) => {
      const token = await this.getAccessToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 429) {
          const retryAfter = parseInt(error.response.headers['retry-after'] || '1');
          await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
          return this.client.request(error.config);
        }
        throw error;
      }
    );
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await axios.post<SpotifyToken>(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${config.SPOTIFY_CLIENT_ID}:${config.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`,
        },
      }
    );

    this.accessToken = response.data.access_token;
    this.tokenExpiry = Date.now() + response.data.expires_in * 1000 - 60000;
    return this.accessToken;
  }

  async getNewReleases(country?: string, limit = 50): Promise<SpotifyTrack[]> {
    const params: any = { limit };
    if (country) params.country = country;

    const response = await this.client.get('/browse/new-releases', { params });
    return response.data.albums.items.flatMap((album: any) =>
      album.tracks?.items || []
    );
  }

  async getArtists(ids: string[]): Promise<SpotifyArtist[]> {
    const batches = [];
    for (let i = 0; i < ids.length; i += 50) {
      batches.push(ids.slice(i, i + 50));
    }

    const results = await Promise.all(
      batches.map(async (batch) => {
        const response = await this.client.get('/artists', {
          params: { ids: batch.join(',') },
        });
        return response.data.artists;
      })
    );

    return results.flat();
  }

  async getArtist(id: string): Promise<SpotifyArtist> {
    const response = await this.client.get(`/artists/${id}`);
    return response.data;
  }

  async getArtistTopTracks(id: string, market = 'US'): Promise<SpotifyTrack[]> {
    const response = await this.client.get(`/artists/${id}/top-tracks`, {
      params: { market },
    });
    return response.data.tracks;
  }

  async getAudioFeatures(ids: string[]): Promise<AudioFeatures[]> {
    const batches = [];
    for (let i = 0; i < ids.length; i += 100) {
      batches.push(ids.slice(i, i + 100));
    }

    const results = await Promise.all(
      batches.map(async (batch) => {
        const response = await this.client.get('/audio-features', {
          params: { ids: batch.join(',') },
        });
        return response.data.audio_features.filter((f: any) => f !== null);
      })
    );

    return results.flat();
  }

  async searchArtists(query: string, limit = 20): Promise<SpotifyArtist[]> {
    const response = await this.client.get('/search', {
      params: {
        q: query,
        type: 'artist',
        limit,
      },
    });
    return response.data.artists.items;
  }

  async searchPlaylists(query: string, limit = 20): Promise<any[]> {
    const response = await this.client.get('/search', {
      params: {
        q: query,
        type: 'playlist',
        limit,
      },
    });
    return response.data.playlists.items;
  }

  async getPlaylistTracks(playlistId: string, limit = 100): Promise<string[]> {
    const response = await this.client.get(`/playlists/${playlistId}/tracks`, {
      params: { limit, fields: 'items(track(artists(id)))' },
    });
    
    return response.data.items
      .filter((item: any) => item.track && item.track.artists)
      .flatMap((item: any) => item.track.artists.map((artist: any) => artist.id));
  }

  async checkArtistInEditorialPlaylists(artistId: string): Promise<number> {
    const editorialQueries = [
      'Today\'s Top Hits',
      'RapCaviar',
      'Hot Country',
      'Rock This',
      'New Music Friday',
      'Viral 50',
    ];

    let playlistCount = 0;

    for (const query of editorialQueries) {
      try {
        const playlists = await this.searchPlaylists(query, 1);
        if (playlists.length > 0) {
          const artistIds = await this.getPlaylistTracks(playlists[0].id);
          if (artistIds.includes(artistId)) {
            playlistCount++;
          }
        }
      } catch (error) {
        console.error(`Error checking playlist ${query}:`, error);
      }
    }

    return playlistCount;
  }
}

export const spotifyClient = new SpotifyClient();