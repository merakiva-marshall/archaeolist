// Clean TypeScript types for Supabase functions and tables\n// Auto-generated by scripts/update-schema.ts\n// For full schema documentation, see docs/schema/\n\nexport interface QueryStats {\n  calls: number | null;\n  mean_exec_time: number | null;\n  query: string | null;\n  rows: number | null;\n  total_exec_seconds: number | null;\n}\n\nexport interface References {\n  id: string;\n  page_ref?: string;\n  reference_name: string;\n  site_id?: string;\n  url?: string;\n}\n\nexport interface UnescoSites {\n  area?: string;\n  buffer_zone?: string;\n  coordinates?: string;\n  criteria?: string;\n  endangered?: string;\n  id: string;\n  inscription?: string;\n  location?: string;\n  reference?: string;\n  site_id?: string;\n  type?: string;\n  unesco_data?: Record<string, any>;\n}\n\nexport interface Sites {\n  address?: string;\n  archaeological_site_yn?: boolean;\n  country?: string;\n  country_slug?: string;\n  created_at?: string;\n  description?: string;\n  faqs?: Record<string, any>;\n  features?: string[];\n  id: string;\n  images?: Record<string, any>;\n  is_unesco?: boolean;\n  last_processed_at?: string;\n  location: GeoJSON.Geometry;\n  metadata?: Record<string, any>;\n  name: string;\n  period?: string[];\n  processed_features?: Record<string, any>;\n  processed_periods?: Record<string, any>;\n  short_description?: string;\n  slug: string;\n  timeline?: Record<string, any>;\n  updated_at?: string;\n  wikipedia_url?: string;\n}\n\nexport interface SitesWithRefCount {\n  address?: string;\n  archaeological_site_yn?: boolean;\n  country?: string;\n  country_slug?: string;\n  created_at?: string;\n  description?: string;\n  faqs?: Record<string, any>;\n  features?: string[];\n  id?: string;\n  images?: Record<string, any>;\n  is_unesco?: boolean;\n  location?: GeoJSON.Geometry;\n  metadata?: Record<string, any>;\n  name?: string;\n  period?: string[];\n  processed_features?: Record<string, any>;\n  processed_periods?: Record<string, any>;\n  reference_count?: number;\n  short_description?: string;\n  slug?: string;\n  timeline?: Record<string, any>;\n  updated_at?: string;\n  wikipedia_url?: string;\n}\n\nexport type GetTableSchema = (\n  p_table_name: string\n) => Promise<Record<string, any>>;\n\nexport type GetClusteredSites = (\n  zoom_level: number,\n  bounds: GeoJSON.Geometry\n) => Promise<Record<string, any>>;\n\nexport type SearchSites = (\n  search_term: string\n) => Promise<Record<string, any>>;\n\nexport type GetSitesInViewport = (\n  viewport_west: number,\n  viewport_south: number,\n  viewport_east: number,\n  viewport_north: number\n) => Promise<Record<string, any>>;\n\nexport type CheckQueryPerformance = (\n) => Promise<Record<string, any>>;\n\nexport type Point = (\n  geometry: any\n) => Promise<GeoJSON.Point>;\n\nexport type Geometry = (\n  path: any\n) => Promise<GeoJSON.Geometry>;\n\nexport type Path = (\n  geometry: any\n) => Promise<GeoJSON.LineString>;\n\nexport type Geometry = (\n  polygon: any\n) => Promise<GeoJSON.Geometry>;\n\nexport type Polygon = (\n  geometry: any\n) => Promise<GeoJSON.Polygon>;\n\nexport type Box3dIn = (\n  cstring: any\n) => Promise<GeoJSON.BBox>;\n\nexport type Box3dOut = (\n  box3d: any\n) => Promise<string>;\n\nexport type Box2dIn = (\n  cstring: any\n) => Promise<GeoJSON.BBox>;\n\nexport type Box2dOut = (\n  box2d: any\n) => Promise<string>;\n\nexport type Box2dfIn = (\n  cstring: any\n) => Promise<GeoJSON.BBox>;\n\nexport type Box2dfOut = (\n  box2df: any\n) => Promise<string>;\n\nexport type GidxIn = (\n  cstring: any\n) => Promise<any>;\n\nexport type GidxOut = (\n  gidx: any\n) => Promise<string>;\n\nexport type GserializedGistSel2d = (\n  internal: any,\n  oid: any,\n  internal: any,\n  integer: any\n) => Promise<number>;\n\nexport type GserializedGistSelNd = (\n  internal: any,\n  oid: any,\n  internal: any,\n  integer: any\n) => Promise<number>;\n\nexport type GserializedGistJoinsel2d = (\n  internal: any,\n  oid: any,\n  internal: any,\n  smallint: any\n) => Promise<number>;\n\nexport type GserializedGistJoinselNd = (\n  internal: any,\n  oid: any,\n  internal: any,\n  smallint: any\n) => Promise<number>;\n\nexport type SpheroidIn = (\n  cstring: any\n) => Promise<any>;\n\nexport type SpheroidOut = (\n  spheroid: any\n) => Promise<string>;\n\nexport type Geometry = (\n  geometry: any,\n  integer: any,\n  boolean: any\n) => Promise<GeoJSON.Geometry>;\n\nexport type Geometry = (\n  point: any\n) => Promise<GeoJSON.Geometry>;\n\nexport type PostgisGetbbox = (\n  geometry: any\n) => Promise<GeoJSON.BBox>;\n\nexport type PostgisAddbbox = (\n  geometry: any\n) => Promise<GeoJSON.Geometry>;\n\nexport type PostgisDropbbox = (\n  geometry: any\n) => Promise<GeoJSON.Geometry>;\n\nexport type PostgisHasbbox = (\n  geometry: any\n) => Promise<boolean>;\n\nexport type PostgisNoop = (\n  geometry: any\n) => Promise<GeoJSON.Geometry>;\n\nexport type PostgisGeosNoop = (\n  geometry: any\n) => Promise<GeoJSON.Geometry>;\n\nexport type Geomfromewkb = (\n  bytea: any\n) => Promise<GeoJSON.Geometry>;\n\nexport type Geomfromewkt = (\n  text: any\n) => Promise<GeoJSON.Geometry>;\n\nexport type PostgisCacheBbox = (\n) => Promise<any>;\n\nexport type PopulateGeometryColumns = (\n  use_typmod: boolean\n) => Promise<string>;\n\nexport type PopulateGeometryColumns = (\n  tbl_oid: number,\n  use_typmod: boolean\n) => Promise<number>;\n\nexport type Addgeometrycolumn = (\n  catalog_name: string,\n  schema_name: string,\n  table_name: string,\n  column_name: string,\n  new_srid_in: number,\n  new_type: string,\n  new_dim: number,\n  use_typmod: boolean\n) => Promise<string>;\n\nexport type Addgeometrycolumn = (\n  schema_name: string,\n  table_name: string,\n  column_name: string,\n  new_srid: number,\n  new_type: string,\n  new_dim: number,\n  use_typmod: boolean\n) => Promise<string>;\n\nexport type Addgeometrycolumn = (\n  table_name: string,\n  column_name: string,\n  new_srid: number,\n  new_type: string,\n  new_dim: number,\n  use_typmod: boolean\n) => Promise<string>;\n\nexport type Dropgeometrycolumn = (\n  catalog_name: string,\n  schema_name: string,\n  table_name: string,\n  column_name: string\n) => Promise<string>;\n\nexport type Dropgeometrycolumn = (\n  schema_name: string,\n  table_name: string,\n  column_name: string\n) => Promise<string>;\n\nexport type Dropgeometrycolumn = (\n  table_name: string,\n  column_name: string\n) => Promise<string>;\n\nexport type PostgisVersion = (\n) => Promise<string>;\n\nexport type Dropgeometrytable = (\n  catalog_name: string,\n  schema_name: string,\n  table_name: string\n) => Promise<string>;\n\nexport type Dropgeometrytable = (\n  schema_name: string,\n  table_name: string\n) => Promise<string>;\n\nexport type Dropgeometrytable = (\n  table_name: string\n) => Promise<string>;\n\nexport type Updategeometrysrid = (\n  catalogn_name: string,\n  schema_name: string,\n  table_name: string,\n  column_name: string,\n  new_srid_in: number\n) => Promise<string>;\n\nexport type Updategeometrysrid = (\n  character: string,\n  character: string,\n  character: string,\n  integer: any\n) => Promise<string>;\n\nexport type Updategeometrysrid = (\n  character: string,\n  character: string,\n  integer: any\n) => Promise<string>;\n\nexport type FindSrid = (\n  character: string,\n  character: string,\n  character: string\n) => Promise<number>;\n\nexport type GetProj4FromSrid = (\n  integer: any\n) => Promise<string>;\n\nexport type PostgisTransformGeometry = (\n  geom: GeoJSON.Geometry,\n  text: any,\n  text: any,\n  integer: any\n) => Promise<GeoJSON.Geometry>;\n\nexport type PostgisLiblwgeomVersion = (\n) => Promise<string>;\n\nexport type PostgisProjVersion = (\n) => Promise<string>;\n\nexport type PostgisWagyuVersion = (\n) => Promise<string>;\n\nexport type PostgisScriptsInstalled = (\n) => Promise<string>;\n\nexport type PostgisLibVersion = (\n) => Promise<string>;\n\nexport type PostgisScriptsReleased = (\n) => Promise<string>;\n\nexport type PostgisGeosVersion = (\n) => Promise<string>;\n\nexport type PostgisLibRevision = (\n) => Promise<string>;\n\nexport type PostgisSvnVersion = (\n) => Promise<string>;\n\nexport type PostgisLibxmlVersion = (\n) => Promise<string>;\n\nexport type PostgisScriptsBuildDate = (\n) => Promise<string>;\n\nexport type PostgisLibBuildDate = (\n) => Promise<string>;\n\nexport type PostgisExtensionsUpgrade = (\n) => Promise<string>;\n\nexport type PostgisFullVersion = (\n) => Promise<string>;\n\nexport type Box2d = (\n  geometry: any\n) => Promise<GeoJSON.BBox>;\n\nexport type Box3d = (\n  geometry: any\n) => Promise<GeoJSON.BBox>;\n\nexport type Box = (\n  geometry: any\n) => Promise<GeoJSON.BBox>;\n\nexport type Box2d = (\n  box3d: any\n) => Promise<GeoJSON.BBox>;\n\nexport type Box3d = (\n  box2d: any\n) => Promise<GeoJSON.BBox>;\n\nexport type Box = (\n  box3d: any\n) => Promise<GeoJSON.BBox>;\n\nexport type Text = (\n  geometry: any\n) => Promise<string>;\n\nexport type Box3dtobox = (\n  box3d: any\n) => Promise<GeoJSON.BBox>;\n\nexport type Geometry = (\n  box2d: any\n) => Promise<GeoJSON.Geometry>;\n\nexport type Geometry = (\n  box3d: any\n) => Promise<GeoJSON.Geometry>;\n\nexport type Geometry = (\n  text: any\n) => Promise<GeoJSON.Geometry>;\n\nexport type Geometry = (\n  bytea: any\n) => Promise<GeoJSON.Geometry>;\n\nexport type Bytea = (\n  geometry: any\n) => Promise<Uint8Array>;\n\nexport type PgisGeometryAccumTransfn = (\n  internal: any,\n  geometry: any\n) => Promise<any>;\n\nexport type PgisGeometryAccumTransfn = (\n  internal: any,\n  geometry: any,\n  double: number\n) => Promise<any>;\n\nexport type PgisGeometryAccumTransfn = (\n  internal: any,\n  geometry: any,\n  double: number,\n  integer: any\n) => Promise<any>;\n\nexport type PgisGeometryCollectFinalfn = (\n  internal: any\n) => Promise<GeoJSON.Geometry>;\n\nexport type PgisGeometryPolygonizeFinalfn = (\n  internal: any\n) => Promise<GeoJSON.Geometry>;\n\nexport type PgisGeometryClusterintersectingFinalfn = (\n  internal: any\n) => Promise<GeoJSON.Geometry[]>;\n\nexport type PgisGeometryClusterwithinFinalfn = (\n  internal: any\n) => Promise<GeoJSON.Geometry[]>;\n\nexport type PgisGeometryMakelineFinalfn = (\n  internal: any\n) => Promise<GeoJSON.Geometry>;\n\nexport type PgisGeometryUnionParallelTransfn = (\n  internal: any,\n  geometry: any\n) => Promise<any>;\n\nexport type PgisGeometryUnionParallelTransfn = (\n  internal: any,\n  geometry: any,\n  double: number\n) => Promise<any>;\n\nexport type PgisGeometryUnionParallelCombinefn = (\n  internal: any,\n  internal: any\n) => Promise<any>;\n\nexport type PgisGeometryUnionParallelSerialfn = (\n  internal: any\n) => Promise<Uint8Array>;\n\nexport type PgisGeometryUnionParallelDeserialfn = (\n  bytea: any,\n  internal: any\n) => Promise<any>;\n\nexport type PgisGeometryUnionParallelFinalfn = (\n  internal: any\n) => Promise<GeoJSON.Geometry>;\n\nexport type PostgisIndexSupportfn = (\n  internal: any\n) => Promise<any>;\n\nexport type Equals = (\n  geom1: GeoJSON.Geometry,\n  geom2: GeoJSON.Geometry\n) => Promise<boolean>;\n\nexport type PostgisLibjsonVersion = (\n) => Promise<string>;\n\nexport type Json = (\n  geometry: any\n) => Promise<Record<string, any>>;\n\nexport type Jsonb = (\n  geometry: any\n) => Promise<Record<string, any>>;\n\nexport type PgisAsmvtTransfn = (\n  internal: any,\n  anyelement: any\n) => Promise<any>;\n\nexport type PgisAsmvtTransfn = (\n  internal: any,\n  anyelement: any,\n  text: any\n) => Promise<any>;\n\nexport type PgisAsmvtTransfn = (\n  internal: any,\n  anyelement: any,\n  text: any,\n  integer: any\n) => Promise<any>;\n\nexport type PgisAsmvtTransfn = (\n  internal: any,\n  anyelement: any,\n  text: any,\n  integer: any,\n  text: any\n) => Promise<any>;\n\nexport type PgisAsmvtTransfn = (\n  internal: any,\n  anyelement: any,\n  text: any,\n  integer: any,\n  text: any,\n  text: any\n) => Promise<any>;\n\nexport type PgisAsmvtFinalfn = (\n  internal: any\n) => Promise<Uint8Array>;\n\nexport type PgisAsmvtCombinefn = (\n  internal: any,\n  internal: any\n) => Promise<any>;\n\nexport type PgisAsmvtSerialfn = (\n  internal: any\n) => Promise<Uint8Array>;\n\nexport type PgisAsmvtDeserialfn = (\n  bytea: any,\n  internal: any\n) => Promise<any>;\n\nexport type PostgisLibprotobufVersion = (\n) => Promise<string>;\n\nexport type PgisAsgeobufTransfn = (\n  internal: any,\n  anyelement: any\n) => Promise<any>;\n\nexport type PgisAsgeobufTransfn = (\n  internal: any,\n  anyelement: any,\n  text: any\n) => Promise<any>;\n\nexport type PgisAsgeobufFinalfn = (\n  internal: any\n) => Promise<Uint8Array>;\n\nexport type PgisAsflatgeobufTransfn = (\n  internal: any,\n  anyelement: any\n) => Promise<any>;\n\nexport type PgisAsflatgeobufTransfn = (\n  internal: any,\n  anyelement: any,\n  boolean: any\n) => Promise<any>;\n\nexport type PgisAsflatgeobufTransfn = (\n  internal: any,\n  anyelement: any,\n  boolean: any,\n  text: any\n) => Promise<any>;\n\nexport type PgisAsflatgeobufFinalfn = (\n  internal: any\n) => Promise<Uint8Array>;\n\nexport type Unlockrows = (\n  text: any\n) => Promise<number>;\n\nexport type Lockrow = (\n  text: any,\n  text: any,\n  text: any,\n  text: any,\n  timestamp: any\n) => Promise<number>;\n\nexport type Lockrow = (\n  text: any,\n  text: any,\n  text: any,\n  text: any\n) => Promise<number>;\n\nexport type Lockrow = (\n  text: any,\n  text: any,\n  text: any\n) => Promise<number>;\n\nexport type Lockrow = (\n  text: any,\n  text: any,\n  text: any,\n  timestamp: any\n) => Promise<number>;\n\nexport type Addauth = (\n  text: any\n) => Promise<boolean>;\n\nexport type Checkauth = (\n  text: any,\n  text: any,\n  text: any\n) => Promise<number>;\n\nexport type Checkauth = (\n  text: any,\n  text: any\n) => Promise<number>;\n\nexport type Checkauthtrigger = (\n) => Promise<any>;\n\nexport type Gettransactionid = (\n) => Promise<number>;\n\nexport type PostgisTypmodSrid = (\n  integer: any\n) => Promise<number>;\n\nexport type PostgisTypmodType = (\n  integer: any\n) => Promise<string>;\n\nexport type Enablelongtransactions = (\n) => Promise<string>;\n\nexport type Longtransactionsenabled = (\n) => Promise<boolean>;\n\nexport type Disablelongtransactions = (\n) => Promise<string>;\n\nexport type Geography = (\n  geography: any,\n  integer: any,\n  boolean: any\n) => Promise<GeoJSON.Geometry>;\n\nexport type Geography = (\n  bytea: any\n) => Promise<GeoJSON.Geometry>;\n\nexport type Bytea = (\n  geography: any\n) => Promise<Uint8Array>;\n\nexport type PostgisTypmodDims = (\n  integer: any\n) => Promise<number>;\n\nexport type Geography = (\n  geometry: any\n) => Promise<GeoJSON.Geometry>;\n\nexport type Geometry = (\n  geography: any\n) => Promise<GeoJSON.Geometry>;\n\nexport type OverlapsGeog = (\n  gidx: any,\n  geography: any\n) => Promise<boolean>;\n\nexport type OverlapsGeog = (\n  gidx: any,\n  gidx: any\n) => Promise<boolean>;\n\nexport type OverlapsGeog = (\n  geography: any,\n  gidx: any\n) => Promise<boolean>;\n\nexport type GeogBrinInclusionAddValue = (\n  internal: any,\n  internal: any,\n  internal: any,\n  internal: any\n) => Promise<boolean>;\n\nexport type PostgisTypeName = (\n  geomname: string,\n  coord_dimension: number,\n  use_new_name: boolean\n) => Promise<string>;\n\nexport type PostgisConstraintSrid = (\n  geomschema: string,\n  geomtable: string,\n  geomcolumn: string\n) => Promise<number>;\n\nexport type PostgisConstraintDims = (\n  geomschema: string,\n  geomtable: string,\n  geomcolumn: string\n) => Promise<number>;\n\nexport type PostgisConstraintType = (\n  geomschema: string,\n  geomtable: string,\n  geomcolumn: string\n) => Promise<string>;\n\nexport type Contains2d = (\n  box2df: any,\n  geometry: any\n) => Promise<boolean>;\n\nexport type IsContained2d = (\n  box2df: any,\n  geometry: any\n) => Promise<boolean>;\n\nexport type Overlaps2d = (\n  box2df: any,\n  geometry: any\n) => Promise<boolean>;\n\nexport type Overlaps2d = (\n  box2df: any,\n  box2df: any\n) => Promise<boolean>;\n\nexport type Contains2d = (\n  box2df: any,\n  box2df: any\n) => Promise<boolean>;\n\nexport type IsContained2d = (\n  box2df: any,\n  box2df: any\n) => Promise<boolean>;\n\nexport type Contains2d = (\n  geometry: any,\n  box2df: any\n) => Promise<boolean>;\n\nexport type IsContained2d = (\n  geometry: any,\n  box2df: any\n) => Promise<boolean>;\n\nexport type Overlaps2d = (\n  geometry: any,\n  box2df: any\n) => Promise<boolean>;\n\nexport type OverlapsNd = (\n  gidx: any,\n  geometry: any\n) => Promise<boolean>;\n\nexport type OverlapsNd = (\n  gidx: any,\n  gidx: any\n) => Promise<boolean>;\n\nexport type OverlapsNd = (\n  geometry: any,\n  gidx: any\n) => Promise<boolean>;\n\nexport type Geom2dBrinInclusionAddValue = (\n  internal: any,\n  internal: any,\n  internal: any,\n  internal: any\n) => Promise<boolean>;\n\nexport type Geom3dBrinInclusionAddValue = (\n  internal: any,\n  internal: any,\n  internal: any,\n  internal: any\n) => Promise<boolean>;\n\nexport type Geom4dBrinInclusionAddValue = (\n  internal: any,\n  internal: any,\n  internal: any,\n  internal: any\n) => Promise<boolean>;\n\nexport type UpdateUpdatedAt = (\n) => Promise<any>;\n