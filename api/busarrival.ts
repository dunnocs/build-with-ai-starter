import type { Request, Response } from 'express';

const LTA_BUS_ARRIVAL_V3_BASE = 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival';
const ARROVELAH_PROXY_BASE = 'https://arrivelah2.busrouter.sg';

// 20-second cache per stop/service combination as recommended by LTA DataMall guidelines
interface BusCacheEntry {
  data: any;
  timestamp: number;
}
const cache = new Map<string, BusCacheEntry>();
const CACHE_TTL_MS = 20000; // 20-second refresh

/**
 * Serverless Bus Arrival v3 Handler
 * Route: GET /api/busarrival
 * Query Parameters:
 *   - BusStopCode: (e.g. 04121 or 83139)
 *   - ServiceNo: (Optional, e.g. 15 or 190)
 * Required Header: AccountKey (from env or incoming request)
 */
export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Retrieve AccountKey without hardcoding
  const accountKey =
    (req.headers['accountkey'] as string) ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.LTA_API_KEY ||
    process.env.ACCOUNT_KEY ||
    '';

  const busStopCode =
    (req.query.BusStopCode as string) ||
    (req.query.busStopCode as string) ||
    (req.query.stop as string) ||
    '04121';

  const serviceNo =
    (req.query.ServiceNo as string) ||
    (req.query.serviceNo as string) ||
    (req.query.service as string) ||
    '';

  const cacheKey = `${busStopCode}_${serviceNo}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.status(200).json(cached.data);
  }

  // Construct official LTA DataMall v3 BusArrival URL
  let ltaUrl = `${LTA_BUS_ARRIVAL_V3_BASE}?BusStopCode=${encodeURIComponent(busStopCode)}`;
  if (serviceNo && serviceNo.trim().length > 0) {
    ltaUrl += `&ServiceNo=${encodeURIComponent(serviceNo.trim())}`;
  }

  // If AccountKey is configured, call LTA DataMall v3 directly
  if (accountKey && accountKey.trim().length > 0) {
    try {
      const response = await fetch(ltaUrl, {
        method: 'GET',
        headers: {
          AccountKey: accountKey.trim(),
          accept: 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        const ltaData = await response.json();
        const payload = {
          ...ltaData,
          source: 'LTA_DATAMALL_V3',
          accountKeyProvided: true,
          requestedStopCode: busStopCode,
          requestedServiceNo: serviceNo || null,
          cachedAt: new Date().toISOString(),
        };

        cache.set(cacheKey, { data: payload, timestamp: Date.now() });
        return res.status(200).json(payload);
      } else {
        console.warn(`[LTA BusArrival v3] Upstream returned status ${response.status}`);
      }
    } catch (err: any) {
      console.error('[LTA BusArrival v3] Network or fetch error:', err.message);
    }
  }

  // Fallback: If AccountKey is pending or upstream returned non-200,
  // query community open proxy and format to standard LTA DataMall v3 structure
  try {
    const fallbackUrl = `${ARROVELAH_PROXY_BASE}/?id=${encodeURIComponent(busStopCode)}`;
    const fbRes = await fetch(fallbackUrl, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(6000),
    });

    if (fbRes.ok) {
      const fbData = await fbRes.json();
      let services = (fbData.services || []).map((s: any) => ({
        ServiceNo: s.no,
        Operator: s.operator || 'SBST',
        NextBus: s.next
          ? {
              OriginCode: s.next.origin_code || '',
              DestinationCode: s.next.destination_code || '',
              EstimatedArrival: s.next.time || '',
              Latitude: String(s.next.lat || ''),
              Longitude: String(s.next.lng || ''),
              VisitNumber: String(s.next.visit_number || '1'),
              Load: s.next.load || 'SEA',
              Feature: s.next.feature || 'WAB',
              Type: s.next.type || 'SD',
            }
          : null,
        NextBus2: s.subsequent
          ? {
              EstimatedArrival: s.subsequent.time || '',
              Load: s.subsequent.load || 'SEA',
              Type: s.subsequent.type || 'SD',
            }
          : null,
        NextBus3: s.next2
          ? {
              EstimatedArrival: s.next2.time || '',
              Load: s.next2.load || 'SEA',
              Type: s.next2.type || 'SD',
            }
          : null,
      }));

      if (serviceNo && serviceNo.trim().length > 0) {
        services = services.filter((s: any) => s.ServiceNo === serviceNo.trim());
      }

      const payload = {
        'odata.metadata': 'https://datamall.lta.gov.sg/ltaodataservice/$metadata#BusArrivalv3/@Element',
        BusStopCode: busStopCode,
        Services: services,
        source: 'OPEN_TRANSPORT_MIRROR',
        accountKeyProvided: Boolean(accountKey && accountKey.length > 0),
        notice: accountKey
          ? 'Serving bus arrivals via fallback bridge'
          : 'Awaiting LTA_ACCOUNT_KEY in .env. Serving real-time open mirror for Bus Stop ' + busStopCode,
        cachedAt: new Date().toISOString(),
      };

      cache.set(cacheKey, { data: payload, timestamp: Date.now() });
      return res.status(200).json(payload);
    }
  } catch (err: any) {
    // Return structured graceful response
  }

  return res.status(200).json({
    'odata.metadata': 'https://datamall.lta.gov.sg/ltaodataservice/$metadata#BusArrivalv3/@Element',
    BusStopCode: busStopCode,
    Services: [],
    source: 'OFFLINE_STANDBY',
    notice: 'No connection to upstream. Please configure LTA_ACCOUNT_KEY in .env.',
    cachedAt: new Date().toISOString(),
  });
}
