export interface QueryStats {
  /**  */
  calls: number| null;
  /**  */
  mean_exec_time: any| null;
  /**  */
  query: string| null;
  /**  */
  rows: number| null;
  /**  */
  total_exec_seconds: any| null;
}



export type GetTableSchema = (
  p_table_name: string
) => Promise<Record<string, any>>;



export type RefreshMapClusters = (
  : any
) => Promise<any>;



export type GetClusteredSites = (
  zoom_level: number, bounds: any
) => Promise<any>;



export type SearchSites = (
  search_term: string
) => Promise<any>;



export type GetSitesInViewport = (
  viewport_west: any, viewport_south: any, viewport_east: any, viewport_north: any
) => Promise<any>;



export type CheckQueryPerformance = (
  : any
) => Promise<any>;



export type Point = (
  geometry: any
) => Promise<any>;



export type Geometry = (
  path: any
) => Promise<any>;



export type Path = (
  geometry: any
) => Promise<any>;



export type Geometry = (
  polygon: any
) => Promise<any>;



export type Polygon = (
  geometry: any
) => Promise<any>;



export type Box3dIn = (
  cstring: any
) => Promise<any>;



export type Box3dOut = (
  box3d: any
) => Promise<any>;



export type Box2dIn = (
  cstring: any
) => Promise<any>;



export type Box2dOut = (
  box2d: any
) => Promise<any>;



export type Box2dfIn = (
  cstring: any
) => Promise<any>;



export type Box2dfOut = (
  box2df: any
) => Promise<any>;



export type GidxIn = (
  cstring: any
) => Promise<any>;



export type GidxOut = (
  gidx: any
) => Promise<any>;



export type PostgisSelectivity = (
  tbl: any, att_name: string, geom: any, mode: string
) => Promise<any>;



export type PostgisJoinSelectivity = (
  regclass: any, text: any, regclass: any, text: any, text: any
) => Promise<any>;



export type PostgisStats = (
  tbl: any, att_name: string, text: any
) => Promise<string>;



export type PostgisIndexExtent = (
  tbl: any, col: string
) => Promise<any>;



export type GserializedGistSel2d = (
  internal: any, oid: any, internal: any, integer: any
) => Promise<any>;



export type GserializedGistSelNd = (
  internal: any, oid: any, internal: any, integer: any
) => Promise<any>;



export type GserializedGistJoinsel2d = (
  internal: any, oid: any, internal: any, smallint: any
) => Promise<any>;



export type GserializedGistJoinselNd = (
  internal: any, oid: any, internal: any, smallint: any
) => Promise<any>;



export type PostgisDeprecate = (
  oldname: string, newname: string, version: string
) => Promise<any>;



export type SpheroidIn = (
  cstring: any
) => Promise<any>;



export type SpheroidOut = (
  spheroid: any
) => Promise<any>;



export type Geometry = (
  geometry: any, integer: any, boolean: any
) => Promise<any>;



export type Geometry = (
  point: any
) => Promise<any>;



export type PostgisGetbbox = (
  geometry: any
) => Promise<any>;



export type PostgisAddbbox = (
  geometry: any
) => Promise<any>;



export type PostgisDropbbox = (
  geometry: any
) => Promise<any>;



export type PostgisHasbbox = (
  geometry: any
) => Promise<boolean>;



export type PostgisNoop = (
  geometry: any
) => Promise<any>;



export type PostgisGeosNoop = (
  geometry: any
) => Promise<any>;



export type Geomfromewkb = (
  bytea: any
) => Promise<any>;



export type Geomfromewkt = (
  text: any
) => Promise<any>;



export type PostgisCacheBbox = (
  : any
) => Promise<any>;



export type PopulateGeometryColumns = (
  use_typmod: boolean
) => Promise<string>;



export type PopulateGeometryColumns = (
  tbl_oid: any, use_typmod: boolean
) => Promise<number>;



export type Addgeometrycolumn = (
  catalog_name: any, schema_name: any, table_name: any, column_name: any, new_srid_in: number, new_type: any, new_dim: number, use_typmod: boolean
) => Promise<string>;



export type Addgeometrycolumn = (
  schema_name: any, table_name: any, column_name: any, new_srid: number, new_type: any, new_dim: number, use_typmod: boolean
) => Promise<string>;



export type Addgeometrycolumn = (
  table_name: any, column_name: any, new_srid: number, new_type: any, new_dim: number, use_typmod: boolean
) => Promise<string>;



export type Dropgeometrycolumn = (
  catalog_name: any, schema_name: any, table_name: any, column_name: any
) => Promise<string>;



export type Dropgeometrycolumn = (
  schema_name: any, table_name: any, column_name: any
) => Promise<string>;



export type Dropgeometrycolumn = (
  table_name: any, column_name: any
) => Promise<string>;



export type PostgisVersion = (
  : any
) => Promise<string>;



export type Dropgeometrytable = (
  catalog_name: any, schema_name: any, table_name: any
) => Promise<string>;



export type Dropgeometrytable = (
  schema_name: any, table_name: any
) => Promise<string>;



export type Dropgeometrytable = (
  table_name: any
) => Promise<string>;



export type Updategeometrysrid = (
  catalogn_name: any, schema_name: any, table_name: any, column_name: any, new_srid_in: number
) => Promise<string>;



export type Updategeometrysrid = (
  character: any, character: any, character: any, integer: any
) => Promise<string>;



export type Updategeometrysrid = (
  character: any, character: any, integer: any
) => Promise<string>;



export type FindSrid = (
  character: any, character: any, character: any
) => Promise<number>;



export type GetProj4FromSrid = (
  integer: any
) => Promise<string>;



export type PostgisTransformGeometry = (
  geom: any, text: any, text: any, integer: any
) => Promise<any>;



export type PostgisLiblwgeomVersion = (
  : any
) => Promise<string>;



export type PostgisProjVersion = (
  : any
) => Promise<string>;



export type PostgisWagyuVersion = (
  : any
) => Promise<string>;



export type PostgisScriptsInstalled = (
  : any
) => Promise<string>;



export type PostgisLibVersion = (
  : any
) => Promise<string>;



export type PostgisScriptsReleased = (
  : any
) => Promise<string>;



export type PostgisGeosVersion = (
  : any
) => Promise<string>;



export type PostgisLibRevision = (
  : any
) => Promise<string>;



export type PostgisSvnVersion = (
  : any
) => Promise<string>;



export type PostgisLibxmlVersion = (
  : any
) => Promise<string>;



export type PostgisScriptsBuildDate = (
  : any
) => Promise<string>;



export type PostgisLibBuildDate = (
  : any
) => Promise<string>;



export type PostgisScriptsPgsqlVersion = (
  : any
) => Promise<string>;



export type PostgisPgsqlVersion = (
  : any
) => Promise<string>;



export type PostgisExtensionsUpgrade = (
  : any
) => Promise<string>;



export type PostgisFullVersion = (
  : any
) => Promise<string>;



export type Box2d = (
  geometry: any
) => Promise<any>;



export type Box3d = (
  geometry: any
) => Promise<any>;



export type Box = (
  geometry: any
) => Promise<any>;



export type Box2d = (
  box3d: any
) => Promise<any>;



export type Box3d = (
  box2d: any
) => Promise<any>;



export type Box = (
  box3d: any
) => Promise<any>;



export type Text = (
  geometry: any
) => Promise<string>;



export type Box3dtobox = (
  box3d: any
) => Promise<any>;



export type Geometry = (
  box2d: any
) => Promise<any>;



export type Geometry = (
  box3d: any
) => Promise<any>;



export type Geometry = (
  text: any
) => Promise<any>;



export type Geometry = (
  bytea: any
) => Promise<any>;



export type Bytea = (
  geometry: any
) => Promise<any>;



export type StVoronoi = (
  g1: any, clip: any, tolerance: any, return_polygons: boolean
) => Promise<any>;



export type PgisGeometryAccumTransfn = (
  internal: any, geometry: any
) => Promise<any>;



export type PgisGeometryAccumTransfn = (
  internal: any, geometry: any, double: any
) => Promise<any>;



export type PgisGeometryAccumTransfn = (
  internal: any, geometry: any, double: any, integer: any
) => Promise<any>;



export type PgisGeometryCollectFinalfn = (
  internal: any
) => Promise<any>;



export type PgisGeometryPolygonizeFinalfn = (
  internal: any
) => Promise<any>;



export type PgisGeometryClusterintersectingFinalfn = (
  internal: any
) => Promise<any>;



export type PgisGeometryClusterwithinFinalfn = (
  internal: any
) => Promise<any>;



export type PgisGeometryMakelineFinalfn = (
  internal: any
) => Promise<any>;



export type PgisGeometryUnionParallelTransfn = (
  internal: any, geometry: any
) => Promise<any>;



export type PgisGeometryUnionParallelTransfn = (
  internal: any, geometry: any, double: any
) => Promise<any>;



export type PgisGeometryUnionParallelCombinefn = (
  internal: any, internal: any
) => Promise<any>;



export type PgisGeometryUnionParallelSerialfn = (
  internal: any
) => Promise<any>;



export type PgisGeometryUnionParallelDeserialfn = (
  bytea: any, internal: any
) => Promise<any>;



export type PgisGeometryUnionParallelFinalfn = (
  internal: any
) => Promise<any>;



export type StLinecrossingdirection = (
  line1: any, line2: any
) => Promise<number>;



export type StDwithin = (
  geom1: any, geom2: any, double: any
) => Promise<boolean>;



export type StTouches = (
  geom1: any, geom2: any
) => Promise<boolean>;



export type StIntersects = (
  geom1: any, geom2: any
) => Promise<boolean>;



export type StCrosses = (
  geom1: any, geom2: any
) => Promise<boolean>;



export type StContains = (
  geom1: any, geom2: any
) => Promise<boolean>;



export type StContainsproperly = (
  geom1: any, geom2: any
) => Promise<boolean>;



export type StCovers = (
  geom1: any, geom2: any
) => Promise<boolean>;



export type StCoveredby = (
  geom1: any, geom2: any
) => Promise<boolean>;



export type StWithin = (
  geom1: any, geom2: any
) => Promise<boolean>;



export type StOverlaps = (
  geom1: any, geom2: any
) => Promise<boolean>;



export type StDfullywithin = (
  geom1: any, geom2: any, double: any
) => Promise<boolean>;



export type St3ddwithin = (
  geom1: any, geom2: any, double: any
) => Promise<boolean>;



export type St3ddfullywithin = (
  geom1: any, geom2: any, double: any
) => Promise<boolean>;



export type St3dintersects = (
  geom1: any, geom2: any
) => Promise<boolean>;



export type StOrderingequals = (
  geom1: any, geom2: any
) => Promise<boolean>;



export type StEquals = (
  geom1: any, geom2: any
) => Promise<boolean>;



export type PostgisIndexSupportfn = (
  internal: any
) => Promise<any>;



export type Equals = (
  geom1: any, geom2: any
) => Promise<boolean>;



export type StGeomfromgml = (
  text: any, integer: any
) => Promise<any>;



export type PostgisLibjsonVersion = (
  : any
) => Promise<string>;



export type StAsgml = (
  integer: any, geometry: any, integer: any, integer: any, text: any, text: any
) => Promise<string>;



export type Json = (
  geometry: any
) => Promise<Record<string, any>>;



export type Jsonb = (
  geometry: any
) => Promise<Record<string, any>>;



export type PgisAsmvtTransfn = (
  internal: any, anyelement: any
) => Promise<any>;



export type PgisAsmvtTransfn = (
  internal: any, anyelement: any, text: any
) => Promise<any>;



export type PgisAsmvtTransfn = (
  internal: any, anyelement: any, text: any, integer: any
) => Promise<any>;



export type PgisAsmvtTransfn = (
  internal: any, anyelement: any, text: any, integer: any, text: any
) => Promise<any>;



export type PgisAsmvtTransfn = (
  internal: any, anyelement: any, text: any, integer: any, text: any, text: any
) => Promise<any>;



export type PgisAsmvtFinalfn = (
  internal: any
) => Promise<any>;



export type PgisAsmvtCombinefn = (
  internal: any, internal: any
) => Promise<any>;



export type PgisAsmvtSerialfn = (
  internal: any
) => Promise<any>;



export type PgisAsmvtDeserialfn = (
  bytea: any, internal: any
) => Promise<any>;



export type PostgisLibprotobufVersion = (
  : any
) => Promise<string>;



export type PgisAsgeobufTransfn = (
  internal: any, anyelement: any
) => Promise<any>;



export type PgisAsgeobufTransfn = (
  internal: any, anyelement: any, text: any
) => Promise<any>;



export type PgisAsgeobufFinalfn = (
  internal: any
) => Promise<any>;



export type PgisAsflatgeobufTransfn = (
  internal: any, anyelement: any
) => Promise<any>;



export type PgisAsflatgeobufTransfn = (
  internal: any, anyelement: any, boolean: any
) => Promise<any>;



export type PgisAsflatgeobufTransfn = (
  internal: any, anyelement: any, boolean: any, text: any
) => Promise<any>;



export type PgisAsflatgeobufFinalfn = (
  internal: any
) => Promise<any>;



export type StSortablehash = (
  geom: any
) => Promise<number>;



export type StMaxdistance = (
  geom1: any, geom2: any
) => Promise<any>;



export type StLongestline = (
  geom1: any, geom2: any
) => Promise<any>;



export type Unlockrows = (
  text: any
) => Promise<number>;



export type Lockrow = (
  text: any, text: any, text: any, text: any, timestamp: any
) => Promise<number>;



export type Lockrow = (
  text: any, text: any, text: any, text: any
) => Promise<number>;



export type Lockrow = (
  text: any, text: any, text: any
) => Promise<number>;



export type Lockrow = (
  text: any, text: any, text: any, timestamp: any
) => Promise<number>;



export type Addauth = (
  text: any
) => Promise<boolean>;



export type Checkauth = (
  text: any, text: any, text: any
) => Promise<number>;



export type Checkauth = (
  text: any, text: any
) => Promise<number>;



export type Checkauthtrigger = (
  : any
) => Promise<any>;



export type Gettransactionid = (
  : any
) => Promise<any>;



export type PostgisTypmodSrid = (
  integer: any
) => Promise<number>;



export type PostgisTypmodType = (
  integer: any
) => Promise<string>;



export type Enablelongtransactions = (
  : any
) => Promise<string>;



export type Longtransactionsenabled = (
  : any
) => Promise<boolean>;



export type Disablelongtransactions = (
  : any
) => Promise<string>;



export type Geography = (
  geography: any, integer: any, boolean: any
) => Promise<any>;



export type Geography = (
  bytea: any
) => Promise<any>;



export type Bytea = (
  geography: any
) => Promise<any>;



export type PostgisTypmodDims = (
  integer: any
) => Promise<number>;



export type Geography = (
  geometry: any
) => Promise<any>;



export type Geometry = (
  geography: any
) => Promise<any>;



export type OverlapsGeog = (
  gidx: any, geography: any
) => Promise<boolean>;



export type OverlapsGeog = (
  gidx: any, gidx: any
) => Promise<boolean>;



export type OverlapsGeog = (
  geography: any, gidx: any
) => Promise<boolean>;



export type GeogBrinInclusionAddValue = (
  internal: any, internal: any, internal: any, internal: any
) => Promise<boolean>;



export type StExpand = (
  geography: any, double: any
) => Promise<any>;



export type StDistanceuncached = (
  geography: any, geography: any, double: any, boolean: any
) => Promise<any>;



export type StDistanceuncached = (
  geography: any, geography: any, boolean: any
) => Promise<any>;



export type StDistanceuncached = (
  geography: any, geography: any
) => Promise<any>;



export type StDistancetree = (
  geography: any, geography: any, double: any, boolean: any
) => Promise<any>;



export type StDistancetree = (
  geography: any, geography: any
) => Promise<any>;



export type StDwithinuncached = (
  geography: any, geography: any, double: any, boolean: any
) => Promise<boolean>;



export type StDwithinuncached = (
  geography: any, geography: any, double: any
) => Promise<boolean>;



export type StPointoutside = (
  geography: any
) => Promise<any>;



export type StBestsrid = (
  geography: any, geography: any
) => Promise<number>;



export type StBestsrid = (
  geography: any
) => Promise<number>;



export type StCovers = (
  geog1: any, geog2: any
) => Promise<boolean>;



export type StDwithin = (
  geog1: any, geog2: any, tolerance: any, use_spheroid: boolean
) => Promise<boolean>;



export type StCoveredby = (
  geog1: any, geog2: any
) => Promise<boolean>;



export type PostgisTypeName = (
  geomname: any, coord_dimension: number, use_new_name: boolean
) => Promise<any>;



export type PostgisConstraintSrid = (
  geomschema: string, geomtable: string, geomcolumn: string
) => Promise<number>;



export type PostgisConstraintDims = (
  geomschema: string, geomtable: string, geomcolumn: string
) => Promise<number>;



export type PostgisConstraintType = (
  geomschema: string, geomtable: string, geomcolumn: string
) => Promise<any>;



export type Contains2d = (
  box2df: any, geometry: any
) => Promise<boolean>;



export type IsContained2d = (
  box2df: any, geometry: any
) => Promise<boolean>;



export type Overlaps2d = (
  box2df: any, geometry: any
) => Promise<boolean>;



export type Overlaps2d = (
  box2df: any, box2df: any
) => Promise<boolean>;



export type Contains2d = (
  box2df: any, box2df: any
) => Promise<boolean>;



export type IsContained2d = (
  box2df: any, box2df: any
) => Promise<boolean>;



export type Contains2d = (
  geometry: any, box2df: any
) => Promise<boolean>;



export type IsContained2d = (
  geometry: any, box2df: any
) => Promise<boolean>;



export type Overlaps2d = (
  geometry: any, box2df: any
) => Promise<boolean>;



export type OverlapsNd = (
  gidx: any, geometry: any
) => Promise<boolean>;



export type OverlapsNd = (
  gidx: any, gidx: any
) => Promise<boolean>;



export type OverlapsNd = (
  geometry: any, gidx: any
) => Promise<boolean>;



export type Geom2dBrinInclusionAddValue = (
  internal: any, internal: any, internal: any, internal: any
) => Promise<boolean>;



export type Geom3dBrinInclusionAddValue = (
  internal: any, internal: any, internal: any, internal: any
) => Promise<boolean>;



export type Geom4dBrinInclusionAddValue = (
  internal: any, internal: any, internal: any, internal: any
) => Promise<boolean>;



export type StAsx3d = (
  integer: any, geometry: any, integer: any, integer: any, text: any
) => Promise<string>;



export type UpdateUpdatedAt = (
  : any
) => Promise<any>;

