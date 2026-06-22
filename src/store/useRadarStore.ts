import { create } from 'zustand';

interface RadarState {
  latitude: number;
  longitude: number;
  timeOffset: number; // For Zenith Time Machine (in minutes)
  showDebris: boolean;
  selectedObjectId: string | null;
  setCoordinates: (lat: number, lng: number) => void;
  setTimeOffset: (offset: number) => void;
  toggleDebris: () => void;
  setSelectedObject: (id: string | null) => void;
}

export const useRadarStore = create<RadarState>((set) => ({
  latitude: 0,
  longitude: 0,
  timeOffset: 0,
  showDebris: false,
  selectedObjectId: null,
  setCoordinates: (lat, lng) => set({ latitude: lat, longitude: lng }),
  setTimeOffset: (offset) => set({ timeOffset: offset }),
  toggleDebris: () => set((state) => ({ showDebris: !state.showDebris })),
  setSelectedObject: (id) => set({ selectedObjectId: id }),
}));
