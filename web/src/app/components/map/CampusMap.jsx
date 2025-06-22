import React, { useState, useEffect } from 'react';
import { MapContainer, GeoJSON, Marker, Polyline, useMapEvents, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './components/CM.2/App.css';
import { findPath } from './components/CM.2/pathfinding';
import SearchBar from './components/SearchBar';
import './components/leafletConfig'; // Import the configuration

// Create different marker icons based on type
const createEntranceMarker = (type) => {
  const colors = {
    main: '#E69946',         // Red for main entrances
    secondary: '#454B9D',    // Steel blue for secondary entrances
    user: '#8D3557',         // Dark blue for user location
    destination: '#2A9D8F',  // Teal green for destination
    default: '#6D6875'       // Neutral gray for unspecified types
  };

  // Increase size for user and destination markers
  const size = type === 'user' || type === 'destination' ? 12 : 10;
  const borderWidth = type === 'user' || type === 'destination' ? 2 : 1.5;

  return L.divIcon({
    html: `
      <div style="
        background-color: ${colors[type] || colors.default}; 
        width: ${size}px; 
        height: ${size}px; 
        border-radius: 50%; 
        border: ${borderWidth}px solid white;
        box-shadow: 0 0 4px rgba(0,0,0,0.3);
      "></div>
    `,
    className: 'custom-div-icon',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -(size/2)]
  });
};

// Add this CSS to your stylesheet
const styles = `
  .custom-div-icon {
    background: none !important;
    border: none !important;
  }
  
  .leaflet-marker-icon {
    background: none !important;
    border: none !important;
  }
  
  .leaflet-div-icon {
    background: none !important;
    border: none !important;
  }
`;

// Add the styles to the document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

// Add this helper function outside the component
function calculateDistance(point1, point2) {
  // Haversine formula for accurate distance calculation
  const R = 6371; // Earth's radius in km
  const dLat = (point2[0] - point1[0]) * Math.PI / 180;
  const dLon = (point2[1] - point1[1]) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1[0] * Math.PI / 180) * Math.cos(point2[0] * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c * 1000; // Convert to meters
  return Math.round(distance);
}

function CampusMap() {
  const [geojsonData, setGeojsonData] = useState(null);
  const [destination, setDestination] = useState(null);
  const [navigationPath, setNavigationPath] = useState(null);
  const [nonWalkableAreas, setNonWalkableAreas] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [userLocation, setUserLocation] = useState([31.442, 31.495]);
  const [isSettingUser, setIsSettingUser] = useState(false);
  const [isSettingDestination, setIsSettingDestination] = useState(true);
  const [borders, setBorders] = useState(null);
  const [entrances, setEntrances] = useState([]);
  const [connectionPoints, setConnectionPoints] = useState(null);
  const [pathwaysData, setPathwaysData] = useState(null);
  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [expandedSection, setExpandedSection] = useState('route');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filters, setFilters] = useState({
    mainEntrances: true,
    secondaryEntrances: true
  });
  const [distance, setDistance] = useState(null);

  // MapEvents component to handle clicks
  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        if (isSettingUser) {
          setUserLocation([lat, lng]);
          setIsSettingUser(false);
        } else if (isSettingDestination) {
          setSelectedPoint([lat, lng]);
        }
      },
    });
    return null;
  };

  useEffect(() => {
    fetch('/map.geojson')
      .then(response => response.json())
      .then(data => {
        // Filter out any features that are just markers or have "Mark" text
        const cleanedFeatures = data.features.filter(feature => {
          // Remove features that are just markers or have Mark text
          if ((feature.properties.name === 'Mark' || 
              feature.properties.name?.includes('Mark')) ||
              (feature.geometry.type === 'Point' && !feature.properties.entrance_type)) {
            return false;
          }
          return true;
        });

        setGeojsonData({
          type: "FeatureCollection",
          features: cleanedFeatures
        });
        
        // Extract only valid entrance points
        const entrancePoints = cleanedFeatures.filter(feature => 
          feature.properties.entrance_type && 
          feature.geometry.type === 'Point'
        );
        setEntrances(entrancePoints);

        // Get university borders
        const borders = cleanedFeatures.find(feature => 
          feature.properties.name === 'Univ_boarders'
        );

        // Get unwalkable areas (buildings, gardens, restricted areas)
        const nonWalkableAreas = cleanedFeatures.filter(feature => {
          const type = feature.properties.type?.toLowerCase() || '';
          const name = feature.properties.name?.toLowerCase() || '';
          
          return type === 'building' || type === 'garden' || type === 'restricted' ||
                 name.includes('building') || name.includes('garden') || name.includes('restricted');
        });

        setNonWalkableAreas(nonWalkableAreas);
        setBorders(borders);
      })
      .catch(error => console.error('Error loading map data:', error));
  }, []);

  // Add new useEffect to load pathways data
  useEffect(() => {
    fetch('/pathways.geojson')
      .then(response => response.json())
      .then(data => {
        // Convert Polygon paths to LineString
        const features = data.features.map(feature => {
          if (feature.geometry.type === 'Polygon') {
            // Convert polygon to line by using its boundary
            return {
              ...feature,
              geometry: {
                type: 'LineString',
                coordinates: feature.geometry.coordinates[0]
              }
            };
          }
          return feature;
        });

        setPathwaysData({
          type: "FeatureCollection",
          features: features
        });
      })
      .catch(error => console.error('Error loading pathways:', error));
  }, []);

  // Update animation timing to be faster (100ms instead of 200ms)
  useEffect(() => {
    if (navigationPath && navigationPath.length >= 2 && animationStep <= navigationPath.length + 1) {
      const timer = setTimeout(() => {
        setAnimationStep(prev => prev + 1);
      }, 100); // Changed from 200ms to 100ms for faster animation
      return () => clearTimeout(timer);
    }
  }, [navigationPath, animationStep]);

  // Update useEffect for pathfinding to reset animation
  useEffect(() => {
    if (!destination || !geojsonData || !borders || !pathwaysData) return;

    const result = findPath(userLocation, destination, nonWalkableAreas, borders, pathwaysData);

    if (result) {
      setNavigationPath(result.path);
      setConnectionPoints(result.connections);
      setAnimationStep(0); // Reset animation
      setIsAnimating(true);
    } else {
      setNavigationPath(null);
      setConnectionPoints(null);
      setAnimationStep(0);
      setIsAnimating(false);
    }
  }, [destination, geojsonData, userLocation, nonWalkableAreas, borders, pathwaysData]);

  // Add this useEffect to calculate distance when path changes
  useEffect(() => {
    if (userLocation && destination) {
      const totalDistance = calculateDistance(userLocation, destination);
      setDistance(totalDistance);
    }
  }, [userLocation, destination, navigationPath]);

  // Update handleSearch to handle all geometry types
  const handleSearch = (feature) => {
    if (!feature?.geometry?.coordinates) return;

    let point;
    
    switch (feature.geometry.type) {
      case 'Polygon':
        // Calculate centroid of polygon
        const coords = feature.geometry.coordinates[0];
        const centroid = coords.reduce(
          (acc, curr) => [acc[0] + curr[0], acc[1] + curr[1]],
          [0, 0]
        ).map(sum => sum / coords.length);
        point = [centroid[1], centroid[0]];
        break;

      case 'LineString':
        // Use middle point of the line
        const lineCoords = feature.geometry.coordinates;
        const midIndex = Math.floor(lineCoords.length / 2);
        point = [lineCoords[midIndex][1], lineCoords[midIndex][0]];
        break;

      case 'Point':
        // Use the point directly
        point = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
        break;

      default:
        console.warn('Unsupported geometry type:', feature.geometry.type);
        return;
    }

    setSelectedPoint(point);
    setDestination(point);
  };

  // Add function to handle Find Path button click
  const handleFindPath = () => {
    if (!selectedPoint) {
      return;
    }
    setDestination(selectedPoint);
  };

  return (
    <div className="App relative h-screen w-full bg-white">
      {/* Add Distance Display */}
      {distance && (
        <div className="absolute top-4 left-[300px] z-[1000] bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <svg 
                className="w-5 h-5 text-[#0066cc]" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <span className="text-sm font-medium text-gray-600">Estimated Distance</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#0066cc]">
                {distance < 1000 ? distance : (distance / 1000).toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">
                {distance < 1000 ? 'm' : 'km'}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Estimated walking time: {Math.ceil(distance / 80)} min
            </div>
          </div>
        </div>
      )}

      {/* Collapsible Sidebar */}
      <div className={`absolute left-0 top-0 bottom-0 bg-[#1a1f2d] transition-all duration-300 ${
        isSidebarOpen ? 'w-[280px]' : 'w-[60px]'
      } shadow-xl z-[1001]`}>
        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-8 bg-[#1a1f2d] rounded-full p-1 shadow-lg z-50"
        >
          <svg 
            className={`w-5 h-5 text-white transform transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Sidebar Content */}
        {isSidebarOpen ? (
          <div className="flex-1 overflow-y-auto">
            {/* Search Bar */}
            <div className="p-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg 
                    className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" 
                    />
                  </svg>
                </div>
                {geojsonData && (
                  <SearchBar 
                    features={geojsonData.features.filter(feature => 
                      feature.properties.name &&
                      feature.properties.type !== 'background' &&
                      feature.properties.type !== 'boarder'
                    )} 
                    onSelect={handleSearch}
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm text-white 
                      border border-gray-700/50 rounded-xl text-sm 
                      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent
                      placeholder-gray-400 transition-all duration-300
                      hover:bg-gray-800/70 focus:bg-gray-800/90"
                    placeholder="Search locations..."
                  />
                )}
                <div className="absolute inset-y-0 right-4 flex items-center">
                  <svg 
                    className="w-5 h-5 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Filter Section */}
            <div className="px-6 mb-6">
              <button 
                onClick={() => setExpandedSection(expandedSection === 'filter' ? null : 'filter')}
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <svg className={`w-4 h-4 text-gray-400 transform transition-transform ${expandedSection === 'filter' ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span>Entrance Filters</span>
                </div>
              </button>
              {expandedSection === 'filter' && (
                <div className="mt-2 space-y-2 pl-4">
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={filters.mainEntrances}
                      onChange={e => setFilters({...filters, mainEntrances: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Main Entrances
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={filters.secondaryEntrances}
                      onChange={e => setFilters({...filters, secondaryEntrances: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Secondary Entrances
                  </label>
                </div>
              )}
            </div>

            {/* Navigation Options */}
            <div className="px-6">
              <div className="divide-y divide-gray-700">
                {/* Route Options */}
                <div className="p-4">
                  <button 
                    onClick={() => setExpandedSection(expandedSection === 'route' ? null : 'route')}
                    className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-300 hover:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${expandedSection === 'route' ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span>Navigation</span>
                    </div>
                  </button>
                  {expandedSection === 'route' && (
                    <div className="mt-2 pl-7 space-y-2">
                      <button 
                        onClick={() => {
                          setIsSettingUser(true);
                          setSelectedPoint(null);
                          setNavigationPath(null);
                        }}
                        className={`w-full px-4 py-2 rounded-lg text-sm transition-all duration-300 flex items-center gap-2 ${
                          isSettingUser 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="3" strokeWidth="2"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v2m0 16v2M2 12h2m16 0h2"/>
                        </svg>
                        <span>Set Start Point</span>
                      </button>

                      <button 
                        onClick={() => setIsSettingDestination(!isSettingDestination)}
                        className={`w-full px-4 py-2 rounded-lg text-sm transition-all duration-300 flex items-center gap-2 ${
                          isSettingDestination 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/>
                          <circle cx="12" cy="10" r="3" strokeWidth="2"/>
                        </svg>
                        <span>Set End Point</span>
                      </button>

                      <button 
                        onClick={handleFindPath}
                        disabled={!selectedPoint || isSettingUser}
                        className={`w-full px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center gap-2 ${
                          selectedPoint && !isSettingUser
                            ? 'hover:bg-gray-800 text-gray-300' 
                            : 'text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        <span>Find Path</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Collapsed Sidebar Icons */
          <div className="flex-1 py-4">
            <div className="space-y-4">
              {/* Search Icon */}
              <button 
                onClick={() => {
                  setIsSidebarOpen(true);
                  setExpandedSection(null);
                }}
                className="w-full p-2 flex justify-center hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                title="Search"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Navigation Icon */}
              <button 
                onClick={() => {
                  setIsSidebarOpen(true);
                  setExpandedSection('route');
                }}
                className="w-full p-2 flex justify-center hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                title="Navigation"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Map Container */}
      <div className={`absolute transition-all duration-300 ${
        isSidebarOpen ? 'left-[280px]' : 'left-[60px]'
      } right-0 top-0 bottom-0`}>
      <MapContainer
        center={[31.442, 31.491]}
        zoom={17}
          className="h-full w-full"
          zoomControl={false}
      >
        <MapEvents />
        {geojsonData && (
          <GeoJSON
            data={geojsonData}
            style={feature => ({
              weight: 2,
              opacity: 1,
              color: feature.properties.type === 'building' ? '#dc2626' : 
                     feature.properties.type === 'restricted' ? '#ef4444' :
                     feature.properties.type === 'garden' ? '#22c55e' :
                     feature.properties.type === 'sports_area' ? '#f59e0b' :
                     feature.properties.type === 'path' ? '#6b7280' :
                     feature.properties.type === 'road' ? '#374151' :
                     '#9ca3af',
              fillOpacity: 0.15
            })}
          />
        )}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={createEntranceMarker('user')}
          />
        )}
        {selectedPoint && !isSettingUser && (
          <Marker
            position={selectedPoint}
            icon={createEntranceMarker('destination')}
          />
        )}
        {navigationPath && navigationPath.length >= 2 && (
          <>
                {/* Initial connection with smooth transition */}
            {animationStep > 0 && (
              <Polyline
                positions={[userLocation, connectionPoints.start]}
                pathOptions={{
                      color: '#2563eb',
                      weight: 4,
                      opacity: 0.8,
                      dashArray: '8, 8',
                      lineCap: 'round',
                      lineJoin: 'round'
                }}
              />
            )}

                {/* Main path segments with smooth transitions */}
            {navigationPath.map((point, index) => {
              if (index === navigationPath.length - 1) return null;
              if (index >= animationStep - 1) return null;
              
              return (
                <Polyline
                  key={`path-${index}`}
                  positions={[navigationPath[index], navigationPath[index + 1]]}
                  pathOptions={{
                        color: '#2563eb',
                        weight: 4,
                        opacity: 0.9,
                        lineCap: 'round',
                        lineJoin: 'round',
                        className: 'path-animation'
                  }}
                />
              );
            })}

                {/* Final connection with smooth transition */}
            {animationStep > navigationPath.length - 1 && (
              <Polyline
                    positions={[connectionPoints.end, destination]}
                pathOptions={{
                      color: '#2563eb',
                      weight: 4,
                      opacity: 0.8,
                      dashArray: '8, 8',
                      lineCap: 'round',
                      lineJoin: 'round'
                }}
              />
            )}

                {/* Connection points with smooth appearance */}
            {animationStep > 0 && (
              <CircleMarker
                center={connectionPoints.start}
                    radius={6}
                pathOptions={{
                      color: '#2563eb',
                      fillColor: '#ffffff',
                  fillOpacity: 1,
                      weight: 2
                }}
              />
            )}
            {animationStep > navigationPath.length - 1 && (
              <CircleMarker
                center={connectionPoints.end}
                    radius={6}
                pathOptions={{
                      color: '#2563eb',
                      fillColor: '#ffffff',
                  fillOpacity: 1,
                      weight: 2
                }}
              />
            )}
          </>
        )}
        {/* Add entrance markers */}
        {entrances
          .filter(entrance => 
            (entrance.properties.entrance_type === 'main' && filters.mainEntrances) ||
            (entrance.properties.entrance_type === 'secondary' && filters.secondaryEntrances)
          )
          .map((entrance, index) => (
          <Marker
            key={`entrance-${index}`}
            position={[entrance.geometry.coordinates[1], entrance.geometry.coordinates[0]]}
            icon={createEntranceMarker(entrance.properties.entrance_type)}
          >
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <strong>{entrance.properties.name || 'Entrance'}</strong>
                {entrance.properties.building && (
                  <>
                    <br />
                    <span>Building: {entrance.properties.building}</span>
                  </>
                )}
                <br />
                <span>Type: {entrance.properties.entrance_type}</span>
              </div>
            </Popup>
          </Marker>
          ))
        }
            {/* Remove or comment out the pathways GeoJSON layer */}
            {/* {pathwaysData && (
          <GeoJSON
            data={pathwaysData}
            style={{
                  color: '#2563eb',
              weight: 2,
                  opacity: 0.4,
                  dashArray: '4, 4'
            }}
          />
            )} */}
      </MapContainer>

        {/* Find Path Button - Top Right */}
        <button 
          onClick={handleFindPath}
          disabled={!selectedPoint || isSettingUser}
          className={`absolute top-4 right-4 z-[1000] px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 ${
            selectedPoint && !isSettingUser
              ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          title="Find Path"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <span className="font-medium">Find Route</span>
        </button>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 z-[1000]">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-1 space-y-1">
              <button className="p-2 hover:bg-gray-100 rounded transition-colors w-8 h-8 flex items-center justify-center text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded transition-colors w-8 h-8 flex items-center justify-center text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampusMap;
