// clock.ts
import { Tool, ToolInterface } from './tool';
import { z } from 'zod';

export function createShowPoisOnMap({
  mapboxAccessToken,
}: {
  mapboxAccessToken: string;
}) {
  if (!mapboxAccessToken) {
    throw new Error('Please set the Mapbox Access Token in the plugin settings.');
  }

  const paramsSchema = z.object({
    pois: z.array(z.object({
      latitude: z.number(),
      longitude: z.number(),
    })),
    zoom: z.number().optional(),
    mapStyle: z.string().optional(),
  })

  const name = 'showPoisOnMap';
  const description = `
  Displays specific Points of Interest (POIs) on a map using the Mapbox Static API.
  pois: An array of POIs to be displayed on the map.
  zoom: The zoom level for the map depends from the place size. For larger places use min value and for smaller use max. For countries use zoom '1.0'-'3.0'; for national parks, states use '4.0'-'6.0'; landmarks, places or cities use '7.0'-'9.0'. If multiple places are provided, this will automatically set to 'auto'.
  mapStyle: The style of the map. Can be 'streets-v12' or 'satellite-streets-v12'.
`

  const execute = async ({ pois, zoom, mapStyle }: z.infer<typeof paramsSchema>) => {
    const accessToken = mapboxAccessToken;

    if (!accessToken) {
      throw new Error('Please set the Mapbox Access Token in the plugin settings.');
    }

    let markers;
    let padding = "";
    let formatZoom = (pois.length == 1 ? 9 : 'auto');
    if (pois.length > 1) {
      markers = pois.map((poi, index) => `pin-s-${index + 1}+FF2F48(${poi.longitude},${poi.latitude})`).join(',');
      padding = "&padding=50,50,50,50";
      formatZoom = formatZoom === 'auto' ? 'auto' : `${formatZoom},0`;
    } else {
      markers = `pin-s+FF2F48(${pois[0].longitude},${pois[0].latitude})`;
      formatZoom = `${formatZoom},0`;
    }
    let coordinates = pois.length == 1 ? `${pois[0].longitude},${pois[0].latitude},${formatZoom}` : 'auto';
    let url = `https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/${markers}/${coordinates}/600x400@2x?access_token=${accessToken}${padding}`;

    let response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return { imageURL: url };
  };

  return new Tool(paramsSchema, name, description, execute).tool;
}
