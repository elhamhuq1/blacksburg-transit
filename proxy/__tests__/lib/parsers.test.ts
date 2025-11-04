/**
 * Unit tests for XML parsers
 */

import { describe, it, expect } from '@jest/globals';
import { parseRoutes, parsePredictions, parseNearbyStops } from '../../lib/parsers.js';

describe('parseRoutes', () => {
  it('should parse valid routes XML', () => {
    const xml = `<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetCurrentRoutesResponse>
      <GetCurrentRoutesResult>
        <Route>
          <RouteID>MSN</RouteID>
          <RouteName>Main Street North</RouteName>
          <ShortName>MSN</ShortName>
          <Color>FF6600</Color>
        </Route>
      </GetCurrentRoutesResult>
    </GetCurrentRoutesResponse>
  </soap:Body>
</soap:Envelope>`;

    const routes = parseRoutes(xml);

    expect(routes).toHaveLength(1);
    expect(routes[0]).toMatchObject({
      id: 'MSN',
      name: 'Main Street North',
      shortName: 'MSN',
      color: '#FF6600',
    });
  });

  it('should return empty array for invalid XML', () => {
    const xml = '<invalid>xml</invalid>';
    const routes = parseRoutes(xml);
    expect(routes).toEqual([]);
  });
});

describe('parsePredictions', () => {
  it('should parse valid predictions XML', () => {
    const xml = `<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetNextDeparturesForStopResponse>
      <GetNextDeparturesForStopResult>
        <StopName>Squires Student Center</StopName>
        <Departure>
          <RouteID>MSN</RouteID>
          <RouteName>Main Street North</RouteName>
          <Headsign>Corporate Research Center</Headsign>
          <Minutes>5</Minutes>
          <DelayMinutes>0</DelayMinutes>
          <IsScheduled>false</IsScheduled>
        </Departure>
      </GetNextDeparturesForStopResult>
    </GetNextDeparturesForStopResponse>
  </soap:Body>
</soap:Envelope>`;

    const result = parsePredictions(xml, '123');

    expect(result.stopId).toBe('123');
    expect(result.stopName).toBe('Squires Student Center');
    expect(result.predictions).toHaveLength(1);
    expect(result.predictions[0]).toMatchObject({
      routeId: 'MSN',
      routeName: 'Main Street North',
      headsign: 'Corporate Research Center',
      etaMinutes: 5,
      etaSeconds: 300,
      status: 'on_time',
      scheduleBased: false,
    });
  });

  it('should handle negative ETAs by clamping to 0', () => {
    const xml = `<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetNextDeparturesForStopResponse>
      <GetNextDeparturesForStopResult>
        <StopName>Test Stop</StopName>
        <Departure>
          <RouteID>TST</RouteID>
          <RouteName>Test Route</RouteName>
          <Headsign>Test Destination</Headsign>
          <Minutes>-2</Minutes>
        </Departure>
      </GetNextDeparturesForStopResult>
    </GetNextDeparturesForStopResponse>
  </soap:Body>
</soap:Envelope>`;

    const result = parsePredictions(xml, '456');
    expect(result.predictions[0].etaMinutes).toBe(0);
    expect(result.predictions[0].etaSeconds).toBe(0);
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

