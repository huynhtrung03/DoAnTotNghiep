declare module '*.geojson' {
  const value: {
    type: string;
    features: Array<{
      type: string;
      properties: {
        gid?: number;
        code?: string;
        ten_tinh?: string;
      };
      geometry: {
        type: string;
        coordinates: any;
      };
    }>;
  };
  export default value;
}
