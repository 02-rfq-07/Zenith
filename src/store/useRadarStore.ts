import { create } from 'zustand';

interface RadarState {
  latitude: number;
  longitude: number;
  timeOffset: number; // For Zenith Time Machine (in minutes)
  showDebris: boolean;
  showConstellations: boolean;
  ambientAudioEnabled: boolean;
  selectedObjectId: string | null;
  setCoordinates: (lat: number, lng: number) => void;
  setTimeOffset: (offset: number) => void;
  toggleDebris: () => void;
  toggleConstellations: () => void;
  toggleAudio: () => void;
  setSelectedObject: (id: string | null) => void;
}

export const useRadarStore = create<RadarState>((set) => ({
  latitude: 0,
  longitude: 0,
  timeOffset: 0,
  showDebris: false,
  showConstellations: false,
  ambientAudioEnabled: false,
  selectedObjectId: null,
  setCoordinates: (lat, lng) => set({ latitude: lat, longitude: lng }),
  setTimeOffset: (offset) => set({ timeOffset: offset }),
  toggleDebris: () => set((state) => ({ showDebris: !state.showDebris })),
  toggleConstellations: () => set((state) => ({ showConstellations: !state.showConstellations })),
  toggleAudio: () => set((state) => ({ ambientAudioEnabled: !state.ambientAudioEnabled })),
  setSelectedObject: (id) => set({ selectedObjectId: id }),
}));
