export interface LdtkWorld {
  jsonVersion?: string;
  defaultGridSize: number;
  defs?: {
    layers?: Array<{ identifier: string; type: string; gridSize: number }>;
    entities?: Array<{ identifier: string }>;
  };
  levels: LdtkLevel[];
}

export interface LdtkLevel {
  identifier: string;
  pxWid: number;
  pxHei: number;
  layerInstances: LdtkLayerInstance[] | null;
}

export interface LdtkLayerInstance {
  __identifier: string;
  __type: "Tiles" | "AutoLayer" | "IntGrid" | "Entities";
  __gridSize: number;
  __tilesetRelPath?: string | null;
  gridTiles?: LdtkTileInstance[];
  autoLayerTiles?: LdtkTileInstance[];
  intGridCsv?: number[];
  entityInstances?: LdtkEntityInstance[];
}

export interface LdtkTileInstance {
  px: [number, number];
  src: [number, number];
  t: number;
}

export interface LdtkEntityInstance {
  __identifier: string;
  iid: string;
  px: [number, number];
  width: number;
  height: number;
  fieldInstances: LdtkFieldInstance[];
}

export interface LdtkFieldInstance {
  __identifier: string;
  __type: string;
  __value: unknown;
}
