import type { Request, Response } from 'express';

/**
 * Serverless Health Check Handler
 * Route: GET /api/health
 */
export default async function handler(req: Request, res: Response) {
  // Support CORS if called directly in serverless environment
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const ltaKey =
    process.env.LTA_ACCOUNT_KEY ||
    process.env.LTA_API_KEY ||
    process.env.ACCOUNT_KEY ||
    '';

  const isConfigured = Boolean(ltaKey && ltaKey.trim().length > 0);

  return res.status(200).json({
    status: 'ok',
    service: 'SG Park & Ride LTA DataMall Serverless Bridge',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    ltaDataMall: {
      accountKeyConfigured: isConfigured,
      keyMasked: isConfigured
        ? `${ltaKey.slice(0, 4)}...${ltaKey.slice(-4)}`
        : 'NOT_SET (Set LTA_ACCOUNT_KEY in .env or secrets)',
      endpoints: {
        busArrivalV3: 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode={code}',
        carparkAvailabilityV2: 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
      },
    },
    availableRoutes: [
      '/api/health',
      '/api/carparkavailability',
      '/api/busarrival',
      '/api/bus-board',
      '/api/carparks',
      '/api/commute-verdict',
      '/api/ai-advisor',
    ],
  });
}
