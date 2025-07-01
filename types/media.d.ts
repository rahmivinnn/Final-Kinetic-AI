declare module '@/types/media' {
  export interface MediaTrack extends MediaStreamTrack {
    enabled: boolean;
    kind: string;
    id: string;
    label: string;
    stop: () => void;
  }

  export interface MediaStreamWithTracks extends MediaStream {
    getTracks: () => MediaTrack[];
    getVideoTracks: () => MediaTrack[];
    getAudioTracks: () => MediaTrack[];
  }
}
