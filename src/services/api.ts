import { SatelliteData } from '../workers/orbitalWorker';

export async function fetchActiveTLEs(): Promise<SatelliteData[]> {
  try {
    // Fetching from local cache to avoid Celestrak rate limits during the hackathon
    const response = await fetch('/active.txt');
    const text = await response.text();
    
    const lines = text.split('\n').map(l => l.trim());
    const tles: SatelliteData[] = [];
    
    for (let i = 0; i < lines.length - 2; i += 3) {
      const name = lines[i];
      const tle1 = lines[i+1];
      const tle2 = lines[i+2];
      
      if (name && tle1 && tle2 && tle1.startsWith('1 ') && tle2.startsWith('2 ')) {
        const id = tle1.substring(2, 7).trim();
        // Determine type based on name or basic heuristics
        let type: SatelliteData['type'] = 'PAYLOAD';
        if (name.includes('DEB')) type = 'DEBRIS';
        else if (name.includes('R/B')) type = 'ROCKET BODY';
        else if (name.includes('ISS')) type = 'PAYLOAD';
        
        tles.push({
          id,
          name,
          tle1,
          tle2,
          type
        });
      }
    }
    
    return tles;
  } catch (error) {
    console.error("Error fetching TLEs", error);
    return [];
  }
}

export async function fetchSkyVisibility(lat: number, lng: number) {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=cloud_cover`);
    const data = await res.json();
    return data.current?.cloud_cover ?? 0;
  } catch (error) {
    console.error("Error fetching weather", error);
    return 0;
  }
}
