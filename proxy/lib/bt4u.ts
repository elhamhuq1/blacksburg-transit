/**
 * SOAP client for Blacksburg Transit BT4U webservice
 * Constructs SOAP XML envelopes and makes HTTP requests
 */

const BT4U_SERVICE_URL =
  process.env.BT4U_SERVICE_URL || 'http://216.252.195.248/webservices/bt4u_webservice.asmx';

const SOAP_TIMEOUT = 3000; // 3 seconds max per request

/**
 * Available BT4U SOAP operations
 */
export type BT4UOperation =
  | 'GetCurrentRoutes'
  | 'GetCurrentBusInfo' // Vehicle positions
  | 'GetNearestStops'
  | 'GetNextDepartures'
  | 'GetNextDeparturesForStop'
  | 'GetScheduledRoutes'
  | 'GetScheduledStopInfo'
  | 'GetScheduledStopCodes'
  | 'GetScheduledStopNames'
  | 'GetScheduledPatternPoints'
  | 'GetPatternPointsForPatternID'
  | 'GetPatternNamesForDate'
  | 'GetArrivalAndDepartureTimesForRoutes'
  | 'GetArrivalAndDepartureTimesForTrip'
  | 'GetActiveAlerts'
  | 'GetAllAlerts';

/**
 * Parameters for SOAP operations
 * (Parameter names must match WSDL schema exactly - camelCase with lowercase first letter)
 */
export interface BT4UParams {
  stopCode?: string;
  routeShortName?: string;
  latitude?: string;
  longitude?: string;
  noOfStops?: string;
  serviceDate?: string;
  direction?: number;
  noOfTrips?: number;
  patternID?: string;
  patternName?: string;
  routeID?: string;
  tripID?: string;
  // Legacy/alternative names (kept for backwards compatibility)
  StopID?: string;
  RouteID?: string;
}

/**
 * Build SOAP XML envelope for BT4U operations
 */
function buildSOAPEnvelope(operation: BT4UOperation, params: BT4UParams = {}): string {
  const paramsXML = Object.entries(params)
    .map(([key, value]) => `<${key}>${value}</${key}>`)
    .join('');

  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <${operation} xmlns="http://www.bt4u.org/">
      ${paramsXML}
    </${operation}>
  </soap:Body>
</soap:Envelope>`;
}

/**
 * Call BT4U SOAP webservice
 */
export async function fetchBT4U(
  operation: BT4UOperation,
  params: BT4UParams = {}
): Promise<string> {
  const soapEnvelope = buildSOAPEnvelope(operation, params);

  // Debug logging
  console.log(`[BT4U] Calling ${operation} with params:`, JSON.stringify(params));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SOAP_TIMEOUT);

  try {
    const response = await fetch(BT4U_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: `http://www.bt4u.org/${operation}`,
      },
      body: soapEnvelope,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[BT4U] ${operation} failed with ${response.status}:`, errorText.substring(0, 500));
      throw new Error(`BT4U API returned ${response.status}: ${response.statusText}`);
    }

    const xmlText = await response.text();
    console.log(`[BT4U] ${operation} success, response length: ${xmlText.length} bytes`);
    return xmlText;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('BT4U API request timed out after 3s');
    }

    throw error;
  }
}

/**
 * Check if BT4U service is available (health check)
 */
export async function checkBT4UHealth(): Promise<{ available: boolean; latency: number }> {
  const start = Date.now();

  try {
    await fetchBT4U('GetCurrentRoutes');
    const latency = Date.now() - start;
    return { available: true, latency };
  } catch (error) {
    const latency = Date.now() - start;
    return { available: false, latency };
  }
}

