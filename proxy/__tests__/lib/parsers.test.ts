/**
 * Unit tests for XML parsers
 */

import { describe, it, expect } from '@jest/globals';
import { parseRoutes, parsePredictions, parseNearbyStops } from '../../lib/parsers.js';

describe('parseRoutes', () => {
  it('should parse real BT4U GetCurrentRoutes response', () => {
    // Real XML structure from BT4U API
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetCurrentRoutesResponse xmlns="http://www.bt4u.org/">
      <GetCurrentRoutesResult>
        <DocumentElement>
          <CurrentRoutes>
            <RouteName>Campus Shuttle</RouteName>
            <RouteShortName>CAS</RouteShortName>
            <RouteColor>302F2F</RouteColor>
            <RouteTextColor>FFFFFF</RouteTextColor>
            <RealTimeInfoAvail>true</RealTimeInfoAvail>
          </CurrentRoutes>
          <CurrentRoutes>
            <RouteName>Main Street North</RouteName>
            <RouteShortName>MSN</RouteShortName>
            <RouteColor>FF6600</RouteColor>
            <RouteTextColor>FFFFFF</RouteTextColor>
            <RealTimeInfoAvail>true</RealTimeInfoAvail>
          </CurrentRoutes>
          <CurrentRoutes>
            <RouteName>Hethwood</RouteName>
            <RouteShortName>HWD</RouteShortName>
            <RouteColor>0000FF</RouteColor>
            <RouteTextColor>FFFFFF</RouteTextColor>
            <RealTimeInfoAvail>true</RealTimeInfoAvail>
          </CurrentRoutes>
        </DocumentElement>
      </GetCurrentRoutesResult>
    </GetCurrentRoutesResponse>
  </soap:Body>
</soap:Envelope>`;

    const routes = parseRoutes(xml);

    expect(routes).toHaveLength(3);
    expect(routes[0]).toMatchObject({
      name: 'Campus Shuttle',
      shortName: 'CAS',
      color: '#302F2F',
      textColor: '#FFFFFF',
    });
    expect(routes[1]).toMatchObject({
      name: 'Main Street North',
      shortName: 'MSN',
      color: '#FF6600',
    });
  });

  it('should handle empty routes response', () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetCurrentRoutesResponse xmlns="http://www.bt4u.org/">
      <GetCurrentRoutesResult>
        <DocumentElement />
      </GetCurrentRoutesResult>
    </GetCurrentRoutesResponse>
  </soap:Body>
</soap:Envelope>`;
    
    const routes = parseRoutes(xml);
    expect(routes).toEqual([]);
  });

  it('should return empty array for invalid XML', () => {
    const xml = '<invalid>xml</invalid>';
    const routes = parseRoutes(xml);
    expect(routes).toEqual([]);
  });
});

describe('parsePredictions', () => {
  it('should parse real BT4U GetNextDepartures response', () => {
    // Real XML structure from BT4U API
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetNextDeparturesResponse xmlns="http://www.bt4u.org/">
      <GetNextDeparturesResult>
        <DocumentElement>
          <NextDepartures>
            <RouteShortName>CAS</RouteShortName>
            <PatternName>CAS to Maroon</PatternName>
            <StopName>Newman Library</StopName>
            <AdjustedDepartureTime>2025-11-04T13:43:34-05:00</AdjustedDepartureTime>
            <CalculatedLoad>0</CalculatedLoad>
          </NextDepartures>
          <NextDepartures>
            <RouteShortName>CAS</RouteShortName>
            <PatternName>CAS to Maroon</PatternName>
            <StopName>Newman Library</StopName>
            <AdjustedDepartureTime>2025-11-04T13:50:41-05:00</AdjustedDepartureTime>
            <CalculatedLoad>1</CalculatedLoad>
          </NextDepartures>
          <NextDepartures>
            <RouteShortName>CAS</RouteShortName>
            <PatternName>CAS to Orange</PatternName>
            <StopName>Newman Library</StopName>
            <AdjustedDepartureTime>2025-11-04T13:56:56-05:00</AdjustedDepartureTime>
            <CalculatedLoad>2</CalculatedLoad>
          </NextDepartures>
        </DocumentElement>
      </GetNextDeparturesResult>
    </GetNextDeparturesResponse>
  </soap:Body>
</soap:Envelope>`;

    const result = parsePredictions(xml, '1100');

    expect(result.stopId).toBe('1100');
    expect(result.stopName).toBe('Newman Library');
    expect(result.predictions).toHaveLength(3);
    
    // First departure
    expect(result.predictions[0]).toMatchObject({
      routeId: 'CAS',
      routeName: 'CAS',
      headsign: 'CAS to Maroon',
    });
    expect(result.predictions[0].etaMinutes).toBeGreaterThanOrEqual(0);
    expect(result.predictions[0].crowding).toBe('low'); // CalculatedLoad 0
    
    // Second departure with medium crowding
    expect(result.predictions[1].crowding).toBe('medium'); // CalculatedLoad 1
    
    // Third departure with high crowding
    expect(result.predictions[2].crowding).toBe('high'); // CalculatedLoad 2
  });

  it('should handle past departure times by clamping to 0', () => {
    // Departure time in the past
    const pastTime = new Date(Date.now() - 120000).toISOString(); // 2 minutes ago
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetNextDeparturesResponse xmlns="http://www.bt4u.org/">
      <GetNextDeparturesResult>
        <DocumentElement>
          <NextDepartures>
            <RouteShortName>TST</RouteShortName>
            <PatternName>Test Pattern</PatternName>
            <StopName>Test Stop</StopName>
            <AdjustedDepartureTime>${pastTime}</AdjustedDepartureTime>
            <CalculatedLoad>0</CalculatedLoad>
          </NextDepartures>
        </DocumentElement>
      </GetNextDeparturesResult>
    </GetNextDeparturesResponse>
  </soap:Body>
</soap:Envelope>`;

    const result = parsePredictions(xml, '456');
    expect(result.predictions[0].etaMinutes).toBe(0);
    expect(result.predictions[0].etaSeconds).toBe(0);
  });

  it('should handle empty departures response', () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetNextDeparturesResponse xmlns="http://www.bt4u.org/">
      <GetNextDeparturesResult>
        <DocumentElement />
      </GetNextDeparturesResult>
    </GetNextDeparturesResponse>
  </soap:Body>
</soap:Envelope>`;
    
    const result = parsePredictions(xml, '789');
    expect(result.stopId).toBe('789');
    expect(result.predictions).toEqual([]);
  });
});

describe('parseNearbyStops', () => {
  it('should calculate distance and walking time', () => {
    const xml = `<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetNearestStopsResponse>
      <GetNearestStopsResult>
        <Stop>
          <StopID>123</StopID>
          <StopName>Squires</StopName>
          <Latitude>37.2296</Latitude>
          <Longitude>-80.4239</Longitude>
          <Routes>MSN,HWD</Routes>
        </Stop>
      </GetNearestStopsResult>
    </GetNearestStopsResponse>
  </soap:Body>
</soap:Envelope>`;

    // User location ~100m away
    const stops = parseNearbyStops(xml, 37.2286, -80.4239);

    expect(stops).toHaveLength(1);
    expect(stops[0]).toMatchObject({
      id: '123',
      name: 'Squires',
      lat: 37.2296,
      lon: -80.4239,
    });
    expect(stops[0].distanceMeters).toBeGreaterThan(0);
    expect(stops[0].walkingTimeSeconds).toBeGreaterThan(0);
  });
});

