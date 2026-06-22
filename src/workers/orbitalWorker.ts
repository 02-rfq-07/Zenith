import * as satellite from 'satellite.js';

export interface SatelliteData {
  name: string;
  id: string;
  tle1: string;
  tle2: string;
  type: 'PAYLOAD' | 'DEBRIS' | 'ROCKET BODY' | 'UNKNOWN';
}

export interface WorkerMessage {
  type: 'START' | 'UPDATE';
  tles?: SatelliteData[];
  latitude?: number;
  longitude?: number;
  timeOffset?: number; // minutes
}

export interface ZenithSatellite {
  id: string;
  name: string;
  elevation: number;
  azimuth: number;
  range: number;
  type: string;
}

let satCache: { satrec: satellite.SatRec; data: SatelliteData }[] = [];
let observerGd: satellite.GeodeticLocation = { longitude: 0, latitude: 0, height: 0 };

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, tles, latitude, longitude, timeOffset = 0 } = e.data;

  if (type === 'START' && tles) {
    satCache = tles
      .map((t) => {
        try {
          return { satrec: satellite.twoline2satrec(t.tle1, t.tle2), data: t };
        } catch {
          return null;
        }
      })
      .filter(Boolean) as { satrec: satellite.SatRec; data: SatelliteData }[];
  }

  if (latitude !== undefined && longitude !== undefined) {
    observerGd = {
      longitude: satellite.degreesToRadians(longitude),
      latitude: satellite.degreesToRadians(latitude),
      height: 0, // Sea level approx
    };
  }

  // Calculate
  const date = new Date(Date.now() + timeOffset * 60000);
  const gmst = satellite.gstime(date);

  const overhead: ZenithSatellite[] = [];

  for (let i = 0; i < satCache.length; i++) {
    const { satrec, data } = satCache[i];
    try {
      const positionAndVelocity = satellite.propagate(satrec, date);
      if (!positionAndVelocity || typeof positionAndVelocity === 'boolean' || !positionAndVelocity.position) continue;
      const positionEci = positionAndVelocity.position as satellite.EciVec3<number>;

      if (!positionEci) continue;

      const positionEcf = satellite.eciToEcf(positionEci, gmst);
      const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);

      const elevationDeg = satellite.radiansToDegrees(lookAngles.elevation);

      // Lowering threshold to 0 degrees (horizon) to ensure the radar is always populated for the demo
      if (elevationDeg >= 0) { 
        overhead.push({
          id: data.id,
          name: data.name,
          elevation: elevationDeg,
          azimuth: satellite.radiansToDegrees(lookAngles.azimuth),
          range: lookAngles.rangeSat,
          type: data.type,
        });
      }
    } catch (err) {
      // Propagation failed for this sat
    }
  }

  self.postMessage({ overhead });
};
