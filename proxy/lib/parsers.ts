/**
 * XML→JSON parsers for BT4U SOAP responses
 * Uses fast-xml-parser to convert XML to JSON, then transforms to our schema
 */

import { XMLParser } from 'fast-xml-parser';
import type {
  Route,
  NearbyStop,
  Prediction,
  StopDepartures,
  RouteStops,
  RouteStop,
  Vehicle,
  Alert,
} from '../types/bt4u.js';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseTagValue: true,
  parseAttributeValue: true,
  trimValues: true,
});

/**
 * Parse GetCurrentRoutes SOAP response
 */
export function parseRoutes(xml: string): Route[] {
  try {
    const parsed = xmlParser.parse(xml);
    console.log('[Parser] GetCurrentRoutes parsed structure:', JSON.stringify(parsed, null, 2).substring(0, 1000));
    
    const body =
      parsed['soap:Envelope']?.['soap:Body'] || parsed['SOAP-ENV:Envelope']?.['SOAP-ENV:Body'];

    if (!body) {
      console.error('[Parser] No SOAP body found');
      return [];
    }

    const result = body.GetCurrentRoutesResponse?.GetCurrentRoutesResult;
    if (!result) {
      console.error('[Parser] No GetCurrentRoutesResult found. Body keys:', Object.keys(body));
      return [];
    }
    
    // The result might have a DocumentElement wrapper
    const documentElement = result.DocumentElement || result;
    const routeData = documentElement.CurrentRoutes || documentElement.Route || documentElement.Routes;
    
    if (!routeData) {
      console.error('[Parser] No Route data found. DocumentElement keys:', Object.keys(documentElement));
      return [];
    }

    const routes = Array.isArray(routeData) ? routeData : [routeData];
    console.log(`[Parser] Found ${routes.length} routes`);

    return routes.map((route: any) => ({
      id: String(route.RouteID || route.ID || ''),
      name: String(route.RouteName || route.Name || ''),
      shortName: String(route.ShortName || route.RouteShortName || route.RouteID || ''),
      color: route.RouteColor || route.Color ? `#${route.RouteColor || route.Color}` : '#FF6600',
      textColor: route.RouteTextColor || route.TextColor ? `#${route.RouteTextColor || route.TextColor}` : '#FFFFFF',
      directions: route.Directions
        ? parseDirections(route.Directions)
        : [
            { id: 0, name: 'Outbound' },
            { id: 1, name: 'Inbound' },
          ],
      serviceHours: route.ServiceHours || undefined,
    }));
  } catch (error) {
    console.error('Error parsing routes XML:', error);
    return [];
  }
}

function parseDirections(directionsData: any): Array<{ id: number; name: string }> {
  if (!directionsData) return [];

  const dirs = Array.isArray(directionsData) ? directionsData : [directionsData];
  return dirs.map((dir: any, index: number) => ({
    id: dir.ID ?? index,
    name: dir.Name || `Direction ${index}`,
  }));
}

/**
 * Parse GetNearestStops SOAP response
 */
export function parseNearbyStops(xml: string, userLat: number, userLon: number): NearbyStop[] {
  try {
    const parsed = xmlParser.parse(xml);
    const body =
      parsed['soap:Envelope']?.['soap:Body'] || parsed['SOAP-ENV:Envelope']?.['SOAP-ENV:Body'];

    if (!body) return [];

    const result = body.GetNearestStopsResponse?.GetNearestStopsResult;
    if (!result || !result.Stop) return [];

    const stops = Array.isArray(result.Stop) ? result.Stop : [result.Stop];

    return stops.map((stop: any) => {
      const lat = parseFloat(stop.Latitude || stop.Lat || 0);
      const lon = parseFloat(stop.Longitude || stop.Lon || 0);
      const distanceMeters = calculateDistance(userLat, userLon, lat, lon);

      return {
        id: String(stop.StopID || stop.ID || ''),
        name: String(stop.StopName || stop.Name || ''),
        lat,
        lon,
        address: stop.Address || undefined,
        routes: parseRouteList(stop.Routes),
        distanceMeters: Math.round(distanceMeters),
        walkingTimeSeconds: Math.round(distanceMeters / 1.4), // 1.4 m/s walking speed
      };
    });
  } catch (error) {
    console.error('Error parsing nearby stops XML:', error);
    return [];
  }
}

/**
 * Parse GetNextDepartures SOAP response
 */
export function parsePredictions(xml: string, stopId: string): StopDepartures {
  try {
    const parsed = xmlParser.parse(xml);
    const body =
      parsed['soap:Envelope']?.['soap:Body'] || parsed['SOAP-ENV:Envelope']?.['SOAP-ENV:Body'];

    // Try new GetNextDepartures format first
    let result = body?.GetNextDeparturesResponse?.GetNextDeparturesResult;
    
    // Fallback to old GetNextDeparturesForStop format if it exists
    if (!result) {
      result = body?.GetNextDeparturesForStopResponse?.GetNextDeparturesForStopResult;
    }

    if (!result) {
      return {
        stopId,
        stopName: '',
        predictions: [],
        cached: false,
        lastUpdated: new Date().toISOString(),
      };
    }

    // Handle DocumentElement wrapper (GetNextDepartures format)
    const documentElement = result.DocumentElement || result;
    
    // Extract stop name from first departure if available
    const departures = documentElement.NextDepartures
      ? Array.isArray(documentElement.NextDepartures)
        ? documentElement.NextDepartures
        : [documentElement.NextDepartures]
      : documentElement.Departure
      ? Array.isArray(documentElement.Departure)
        ? documentElement.Departure
        : [documentElement.Departure]
      : [];

    const stopName = departures[0]?.StopName || result.StopName || '';

    const predictions: Prediction[] = departures.map((dep: any) => {
      // Parse AdjustedDepartureTime (GetNextDepartures format)
      const now = new Date();
      let predictedArrivalTime: string;
      let etaMinutes: number;
      let etaSeconds: number;

      if (dep.AdjustedDepartureTime) {
        // Parse ISO 8601 datetime from BT4U
        predictedArrivalTime = new Date(dep.AdjustedDepartureTime).toISOString();
        etaSeconds = Math.max(0, Math.floor((new Date(dep.AdjustedDepartureTime).getTime() - now.getTime()) / 1000));
        etaMinutes = Math.floor(etaSeconds / 60);
      } else {
        // Fallback to Minutes/ETA format (old format)
        etaMinutes = parseInt(dep.Minutes || dep.ETA || 0, 10);
        etaSeconds = etaMinutes * 60;
        predictedArrivalTime = new Date(now.getTime() + etaSeconds * 1000).toISOString();
      }

      const scheduleBased = dep.IsScheduled === true || dep.ScheduleBased === true;
      const delayMinutes = parseInt(dep.DelayMinutes || 0, 10);

      let status: Prediction['status'] = 'on_time';
      if (scheduleBased) status = 'scheduled';
      else if (delayMinutes > 5) status = 'delayed';
      else if (delayMinutes < -2) status = 'early';

      return {
        routeId: String(dep.RouteID || dep.Route || dep.RouteShortName || ''),
        routeName: String(dep.RouteName || dep.RouteShortName || ''),
        headsign: String(dep.Headsign || dep.Destination || dep.PatternName || ''),
        predictedArrivalTime,
        etaMinutes: Math.max(0, etaMinutes),
        etaSeconds: Math.max(0, etaSeconds),
        status,
        delayMinutes,
        vehicleId: dep.VehicleID ? String(dep.VehicleID) : undefined,
        scheduleBased,
        crowding: dep.CalculatedLoad !== undefined 
          ? dep.CalculatedLoad === 0 
            ? 'low' 
            : dep.CalculatedLoad === 1 
            ? 'medium' 
            : 'high'
          : undefined,
      };
    });

    return {
      stopId,
      stopName,
      predictions,
      cached: false,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error parsing predictions XML:', error);
    return {
      stopId,
      stopName: '',
      predictions: [],
      cached: false,
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Parse GetRouteStops SOAP response
 */
export function parseRouteStops(xml: string, routeId: string, direction: number): RouteStops {
  try {
    const parsed = xmlParser.parse(xml);
    
    // Navigate through SOAP envelope to get to DocumentElement
    const body =
      parsed['soap:Envelope']?.['soap:Body'] || parsed['SOAP-ENV:Envelope']?.['SOAP-ENV:Body'];
    
    const result = body?.GetScheduledStopInfoResponse?.GetScheduledStopInfoResult;
    const docElement = result?.DocumentElement;
    
    if (!docElement || !docElement.ScheduledStops) {
      console.log('[parseRouteStops] No ScheduledStops found in XML');
      return {
        routeId,
        direction,
        directionName: direction === 0 ? 'Outbound' : 'Inbound',
        stops: [],
      };
    }

    const stops = Array.isArray(docElement.ScheduledStops) 
      ? docElement.ScheduledStops 
      : [docElement.ScheduledStops];
    
    const directionName = direction === 0 ? 'Outbound' : 'Inbound';

    const routeStops: RouteStop[] = stops.map((stop: any, index: number) => ({
      id: String(stop.StopCode || ''),
      name: String(stop.StopName || ''),
      code: String(stop.StopCode || ''),
      sequence: index + 1,
      lat: parseFloat(stop.Latitude || 0),
      lon: parseFloat(stop.Longitude || 0),
    }));

    console.log(`[parseRouteStops] Parsed ${routeStops.length} stops for route ${routeId} direction ${direction}`);

    return {
      routeId,
      direction,
      directionName,
      stops: routeStops,
    };
  } catch (error) {
    console.error('Error parsing route stops XML:', error);
    return {
      routeId,
      direction,
      directionName: direction === 0 ? 'Outbound' : 'Inbound',
      stops: [],
    };
  }
}

/**
 * Parse GetVehiclePositions SOAP response
 */
export function parseVehicles(xml: string): Vehicle[] {
  try {
    const parsed = xmlParser.parse(xml);
    const body =
      parsed['soap:Envelope']?.['soap:Body'] || parsed['SOAP-ENV:Envelope']?.['SOAP-ENV:Body'];

    const result = body.GetVehiclePositionsResponse?.GetVehiclePositionsResult;

    if (!result || !result.Vehicle) return [];

    const vehicles = Array.isArray(result.Vehicle) ? result.Vehicle : [result.Vehicle];

    return vehicles.map((veh: any) => ({
      vehicleId: String(veh.VehicleID || veh.ID || ''),
      routeId: String(veh.RouteID || ''),
      lat: parseFloat(veh.Latitude || veh.Lat || 0),
      lon: parseFloat(veh.Longitude || veh.Lon || 0),
      heading: parseFloat(veh.Heading || 0),
      speed: parseFloat(veh.Speed || 0),
      lastUpdated: veh.Timestamp || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error parsing vehicles XML:', error);
    return [];
  }
}

/**
 * Parse GetAlerts SOAP response
 */
export function parseAlerts(xml: string): Alert[] {
  try {
    const parsed = xmlParser.parse(xml);
    const body =
      parsed['soap:Envelope']?.['soap:Body'] || parsed['SOAP-ENV:Envelope']?.['SOAP-ENV:Body'];

    const result = body.GetAlertsResponse?.GetAlertsResult;

    if (!result || !result.Alert) return [];

    const alerts = Array.isArray(result.Alert) ? result.Alert : [result.Alert];

    return alerts.map((alert: any) => ({
      id: String(alert.AlertID || alert.ID || ''),
      severity: (alert.Severity?.toLowerCase() || 'info') as Alert['severity'],
      cause: String(alert.Cause || ''),
      effect: String(alert.Effect || ''),
      description: String(alert.Description || ''),
      affectedRoutes: parseStringList(alert.AffectedRoutes),
      affectedStops: parseStringList(alert.AffectedStops),
      startTime: alert.StartTime || new Date().toISOString(),
      endTime: alert.EndTime || new Date(Date.now() + 86400000).toISOString(),
      postedAt: alert.PostedAt || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error parsing alerts XML:', error);
    return [];
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function parseRouteList(routesData: any): string[] {
  if (!routesData) return [];
  if (typeof routesData === 'string') return routesData.split(',').map((r) => r.trim());
  if (Array.isArray(routesData)) return routesData.map((r) => String(r));
  return [];
}

function parseStringList(data: any): string[] {
  if (!data) return [];
  if (typeof data === 'string') return data.split(',').map((s) => s.trim());
  if (Array.isArray(data)) return data.map((s) => String(s));
  return [];
}

/**
 * Calculate haversine distance between two lat/lon points (in meters)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

