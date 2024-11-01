import { useEffect, useState } from 'react';
import {
  GoogleMap,
  type Libraries,
  useJsApiLoader,
} from '@react-google-maps/api';
import { env } from '@/config/env';

const MAX_ZOOM_ALLOWED = 22;
const MIN_ZOOM_ALLOWED = 3;
const FULL_USA_VIEW_STATE = {
  longitude: -95.71652175901282,
  latitude: 39.79397994995538,
  zoom: 5,
};
const DEFAULT_CENTER = {
  lat: FULL_USA_VIEW_STATE.latitude,
  lng: FULL_USA_VIEW_STATE.longitude,
};
const GOOGLE_LIBRARIES: Libraries = ['marker'];

export function Map({
  children,
  initialViewState,
  getMapRef,
  showLocationButton,
  locationButtonProps,
}: React.PropsWithChildren<any>) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_API_KEY ?? '',
    libraries: GOOGLE_LIBRARIES,
  });

  const [map, setMap] = useState<any | null>(null);
  const [mapStyle, setMapStyle] = useState<'roadmap' | 'hybrid'>('roadmap');

  function handleZoomChange(type: 'increase' | 'decrease') {
    return () => {
      const mapZoom = map?.getZoom();

      if (typeof mapZoom !== 'number') {
        return;
      }

      if (type === 'decrease') {
        map?.setZoom(Math.max(mapZoom - 1, MIN_ZOOM_ALLOWED));
      }

      if (type === 'increase') {
        map?.setZoom(Math.min(mapZoom + 1, MAX_ZOOM_ALLOWED));
      }
    };
  }

  useEffect(() => {
    if (!map) {
      return;
    }

    if (typeof initialViewState?.zoom === 'number') {
      map.setZoom(initialViewState.zoom);
    }

    if (
      typeof initialViewState?.latitude === 'number' &&
      typeof initialViewState?.longitude === 'number'
    ) {
      map.setCenter({
        lat: initialViewState.latitude,
        lng: initialViewState.longitude,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return (
    <>
      {isLoaded && (
        <>
          <GoogleMap
            mapContainerStyle={{
              width: '100vw', // Full viewport width
              height: '100vh', // Full viewport height
            }}
            center={DEFAULT_CENTER}
            zoom={FULL_USA_VIEW_STATE.zoom}
            mapTypeId={mapStyle}
            options={{
              maxZoom: MAX_ZOOM_ALLOWED,
              minZoom: MIN_ZOOM_ALLOWED,
              mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID,
              clickableIcons: false,
            }}
            onLoad={(_map) => {
              setMap(_map);
              getMapRef?.(_map);
            }}
            onUnmount={() => setMap(null)}
          >
            {children}
          </GoogleMap>
        </>
      )}
    </>
  );
}

Map.FULL_USA_VIEW_STATE = FULL_USA_VIEW_STATE;
