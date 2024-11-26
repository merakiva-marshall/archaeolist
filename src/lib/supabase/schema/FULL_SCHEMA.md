# Complete Database Schema Documentation

This document contains all database objects, including system tables and PostGIS functions. For application-specific schema, see README.md.

## Tables

### references

#### Columns

| Column | Type | Nullable | Default | Identity | Description |
|--------|------|----------|----------|----------|-------------|
| id | uuid | No | gen_random_uuid() | No | - |
| page_ref | text | Yes | - | No | - |
| reference_name | text | No | - | No | - |
| site_id | uuid | Yes | - | No | - |
| url | text | Yes | - | No | - |

#### Row Level Security Policies

| Policy | Command | Type | Definition |
|---------|---------|------|------------|
| Public read access for references | r | PERMISSIVE | true |
| Enable insert for authenticated users only | a | PERMISSIVE | null |
| Enable update for authenticated users only | w | PERMISSIVE | true |


### sites_with_ref_count

#### Columns

| Column | Type | Nullable | Default | Identity | Description |
|--------|------|----------|----------|----------|-------------|
| address | text | Yes | - | No | - |
| country | text | Yes | - | No | - |
| created_at | timestamp with time zone | Yes | - | No | - |
| description | text | Yes | - | No | - |
| features | text[] | Yes | - | No | - |
| id | uuid | Yes | - | No | - |
| images | jsonb | Yes | - | No | - |
| location | PostGIS geometry | Yes | - | No | - |
| metadata | jsonb | Yes | - | No | - |
| name | text | Yes | - | No | - |
| period | text[] | Yes | - | No | - |
| reference_count | bigint | Yes | - | No | - |
| slug | text | Yes | - | No | - |
| updated_at | timestamp with time zone | Yes | - | No | - |
| wikipedia_url | text | Yes | - | No | - |


### unesco_sites

#### Columns

| Column | Type | Nullable | Default | Identity | Description |
|--------|------|----------|----------|----------|-------------|
| area | text | Yes | - | No | - |
| buffer_zone | text | Yes | - | No | - |
| coordinates | text | Yes | - | No | - |
| criteria | text | Yes | - | No | Criteria under which the site was inscribed' |
| endangered | text | Yes | - | No | - |
| id | uuid | No | gen_random_uuid() | No | - |
| inscription | text | Yes | - | No | Year the site was inscribed on the World Heritage List |
| location | text | Yes | - | No | - |
| reference | text | Yes | - | No | Unique identifier assigned by UNESCO |
| site_id | uuid | Yes | - | No | - |
| type | text | Yes | - | No | - |
| unesco_data | jsonb | Yes | - | No | - |

#### Row Level Security Policies

| Policy | Command | Type | Definition |
|---------|---------|------|------------|
| Public read access for unesco_sites | r | PERMISSIVE | true |
| Enable insert for authenticated users only | a | PERMISSIVE | null |
| Enable update for authenticated users only | w | PERMISSIVE | true |


### sites

#### Columns

| Column | Type | Nullable | Default | Identity | Description |
|--------|------|----------|----------|----------|-------------|
| address | text | Yes | - | No | - |
| archaeological_site_yn | boolean | Yes | true | No | - |
| country | text | Yes | - | No | - |
| country_slug | text | Yes | - | No | - |
| created_at | timestamp with time zone | Yes | now() | No | - |
| description | text | Yes | - | No | - |
| features | text[] | Yes | - | No | - |
| id | uuid | No | gen_random_uuid() | No | - |
| images | jsonb | Yes | '[]'::jsonb | No | - |
| is_unesco | boolean | Yes | false | No | for "true" links to "unesco_sites" table |
| last_processed_at | timestamp with time zone | Yes | - | No | - |
| location | PostGIS geometry | No | - | No | PostGIS type |
| metadata | jsonb | Yes | '{}'::jsonb | No | - |
| name | text | No | - | No | - |
| period | text[] | Yes | - | No | - |
| processed_features | jsonb | Yes | - | No | - |
| processed_periods | jsonb | Yes | - | No | - |
| short_description | text | Yes | - | No | - |
| slug | text | No | - | No | main key |
| timeline | jsonb | Yes | - | No | - |
| updated_at | timestamp with time zone | Yes | now() | No | - |
| wikipedia_url | text | Yes | - | No | - |

#### Row Level Security Policies

| Policy | Command | Type | Definition |
|---------|---------|------|------------|
| Public read access for sites | r | PERMISSIVE | true |
| Enable insert for authenticated users only | a | PERMISSIVE | null |
| Enable update for authenticated users only | w | PERMISSIVE | true |


### query_stats

#### Columns

| Column | Type | Nullable | Default | Identity | Description |
|--------|------|----------|----------|----------|-------------|
| calls | bigint | Yes | - | No | - |
| mean_exec_time | double precision | Yes | - | No | - |
| query | text | Yes | - | No | - |
| rows | bigint | Yes | - | No | - |
| total_exec_seconds | double precision | Yes | - | No | - |



## All Functions

### get_table_schema

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: Yes
- **Arguments**: p_table_name text
- **Returns**: jsonb

```sql
CREATE OR REPLACE FUNCTION public.get_table_schema(p_table_name text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result jsonb;
BEGIN
  RAISE NOTICE 'Fetching schema for table: %', p_table_name;

  SELECT jsonb_object_agg(columns.column_name, jsonb_build_object(
    'data_type', columns.data_type,
    'is_nullable', columns.is_nullable,
    'column_default', columns.column_default
  ))
  INTO result
  FROM information_schema.columns
  WHERE columns.table_schema = 'public' AND columns.table_name = p_table_name;

  IF result IS NULL THEN
    RAISE EXCEPTION 'No columns found for table: %', p_table_name;
  END IF;

  RAISE NOTICE 'Schema fetched successfully: %', result;
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in get_table_schema: %', SQLERRM;
    RAISE;
END;
$function$

```


### refresh_map_clusters

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: 
- **Returns**: trigger

```sql
CREATE OR REPLACE FUNCTION public.refresh_map_clusters()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY map_clusters_z5;
  RETURN NULL;
END;
$function$

```


### get_clustered_sites

- **Type**: function
- **Language**: plpgsql
- **Volatility**: stable
- **Security Definer**: Yes
- **Arguments**: zoom_level integer, bounds geometry
- **Returns**: TABLE(id uuid, location geometry, site_count integer, unesco_count integer, site_names text[], periods text[])

```sql
CREATE OR REPLACE FUNCTION public.get_clustered_sites(zoom_level integer, bounds geometry)
 RETURNS TABLE(id uuid, location geometry, site_count integer, unesco_count integer, site_names text[], periods text[])
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.location,
    c.site_count,
    c.unesco_count,
    c.site_names,
    c.periods
  FROM map_clusters_z5 c
  WHERE ST_Intersects(c.location, bounds);
END;
$function$

```


### search_sites

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: search_term text
- **Returns**: TABLE(id uuid, name text, slug text, description text, country text, reference_count bigint)

```sql
CREATE OR REPLACE FUNCTION public.search_sites(search_term text)
 RETURNS TABLE(id uuid, name text, slug text, description text, country text, reference_count bigint)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.slug,
        s.description,
        s.country,
        COUNT(r.id) AS reference_count
    FROM 
        public.sites s
    LEFT JOIN 
        public.references r ON s.id = r.site_id
    WHERE 
        s.name ILIKE '%' || search_term || '%'
        OR s.description ILIKE '%' || search_term || '%'
        OR s.country ILIKE '%' || search_term || '%'
    GROUP BY 
        s.id
    ORDER BY 
        s.name;
END;
$function$

```


### get_sites_in_viewport

- **Type**: function
- **Language**: sql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: viewport_west double precision, viewport_south double precision, viewport_east double precision, viewport_north double precision
- **Returns**: TABLE(id uuid, name text, description text, location jsonb, address text, period text[], features text[], country text, country_slug text, slug text)

```sql
CREATE OR REPLACE FUNCTION public.get_sites_in_viewport(viewport_west double precision, viewport_south double precision, viewport_east double precision, viewport_north double precision)
 RETURNS TABLE(id uuid, name text, description text, location jsonb, address text, period text[], features text[], country text, country_slug text, slug text)
 LANGUAGE sql
AS $function$
  SELECT 
    id, 
    name,
    description,
    jsonb_build_object(
      'coordinates',
      jsonb_build_array(
        ST_X(location::geometry),
        ST_Y(location::geometry)
      )
    ) as location,
    address,
    period,
    features,
    country,
    country_slug,
    slug
  FROM sites
  WHERE location && 
    ST_MakeEnvelope(
      viewport_west, 
      viewport_south, 
      viewport_east, 
      viewport_north, 
      4326
    );
$function$

```


### check_query_performance

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: 
- **Returns**: TABLE(view_name text, last_analyze timestamp without time zone, estimated_rows bigint, live_rows bigint, last_vacuum timestamp without time zone)

```sql
CREATE OR REPLACE FUNCTION public.check_query_performance()
 RETURNS TABLE(view_name text, last_analyze timestamp without time zone, estimated_rows bigint, live_rows bigint, last_vacuum timestamp without time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname || '.' || relname as view_name,
        last_analyze,
        n_live_tup as estimated_rows,
        n_live_tup as live_rows,
        last_vacuum
    FROM pg_stat_user_tables
    WHERE relname LIKE 'map_clusters%'
    ORDER BY last_analyze DESC;
END;
$function$

```


### point

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geometry
- **Returns**: point

```sql
CREATE OR REPLACE FUNCTION public.point(geometry)
 RETURNS point
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geometry_to_point$function$

```


### geometry

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: path
- **Returns**: geometry

```sql
CREATE OR REPLACE FUNCTION public.geometry(path)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$path_to_geometry$function$

```


### path

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geometry
- **Returns**: path

```sql
CREATE OR REPLACE FUNCTION public.path(geometry)
 RETURNS path
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geometry_to_path$function$

```


### geometry

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: polygon
- **Returns**: geometry

```sql
CREATE OR REPLACE FUNCTION public.geometry(polygon)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$polygon_to_geometry$function$

```


### polygon

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geometry
- **Returns**: polygon

```sql
CREATE OR REPLACE FUNCTION public.polygon(geometry)
 RETURNS polygon
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geometry_to_polygon$function$

```


### box3d_in

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: cstring
- **Returns**: box3d

```sql
CREATE OR REPLACE FUNCTION public.box3d_in(cstring)
 RETURNS box3d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX3D_in$function$

```


### box3d_out

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: box3d
- **Returns**: cstring

```sql
CREATE OR REPLACE FUNCTION public.box3d_out(box3d)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX3D_out$function$

```


### box2d_in

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: cstring
- **Returns**: box2d

```sql
CREATE OR REPLACE FUNCTION public.box2d_in(cstring)
 RETURNS box2d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX2D_in$function$

```


### box2d_out

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: box2d
- **Returns**: cstring

```sql
CREATE OR REPLACE FUNCTION public.box2d_out(box2d)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$BOX2D_out$function$

```


### box2df_in

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: cstring
- **Returns**: box2df

```sql
CREATE OR REPLACE FUNCTION public.box2df_in(cstring)
 RETURNS box2df
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$box2df_in$function$

```


### box2df_out

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: box2df
- **Returns**: cstring

```sql
CREATE OR REPLACE FUNCTION public.box2df_out(box2df)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$box2df_out$function$

```


### gidx_in

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: cstring
- **Returns**: gidx

```sql
CREATE OR REPLACE FUNCTION public.gidx_in(cstring)
 RETURNS gidx
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gidx_in$function$

```


### gidx_out

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: gidx
- **Returns**: cstring

```sql
CREATE OR REPLACE FUNCTION public.gidx_out(gidx)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gidx_out$function$

```


### _postgis_selectivity

- **Type**: function
- **Language**: c
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: tbl regclass, att_name text, geom geometry, mode text DEFAULT '2'::text
- **Returns**: double precision

```sql
CREATE OR REPLACE FUNCTION public._postgis_selectivity(tbl regclass, att_name text, geom geometry, mode text DEFAULT '2'::text)
 RETURNS double precision
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$_postgis_gserialized_sel$function$

```


### _postgis_join_selectivity

- **Type**: function
- **Language**: c
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: regclass, text, regclass, text, text DEFAULT '2'::text
- **Returns**: double precision

```sql
CREATE OR REPLACE FUNCTION public._postgis_join_selectivity(regclass, text, regclass, text, text DEFAULT '2'::text)
 RETURNS double precision
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$_postgis_gserialized_joinsel$function$

```


### _postgis_stats

- **Type**: function
- **Language**: c
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: tbl regclass, att_name text, text DEFAULT '2'::text
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public._postgis_stats(tbl regclass, att_name text, text DEFAULT '2'::text)
 RETURNS text
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$_postgis_gserialized_stats$function$

```


### _postgis_index_extent

- **Type**: function
- **Language**: c
- **Volatility**: stable
- **Security Definer**: No
- **Arguments**: tbl regclass, col text
- **Returns**: box2d

```sql
CREATE OR REPLACE FUNCTION public._postgis_index_extent(tbl regclass, col text)
 RETURNS box2d
 LANGUAGE c
 STABLE STRICT
AS '$libdir/postgis-3', $function$_postgis_gserialized_index_extent$function$

```


### gserialized_gist_sel_2d

- **Type**: function
- **Language**: c
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: internal, oid, internal, integer
- **Returns**: double precision

```sql
CREATE OR REPLACE FUNCTION public.gserialized_gist_sel_2d(internal, oid, internal, integer)
 RETURNS double precision
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_sel_2d$function$

```


### gserialized_gist_sel_nd

- **Type**: function
- **Language**: c
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: internal, oid, internal, integer
- **Returns**: double precision

```sql
CREATE OR REPLACE FUNCTION public.gserialized_gist_sel_nd(internal, oid, internal, integer)
 RETURNS double precision
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_sel_nd$function$

```


### gserialized_gist_joinsel_2d

- **Type**: function
- **Language**: c
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: internal, oid, internal, smallint
- **Returns**: double precision

```sql
CREATE OR REPLACE FUNCTION public.gserialized_gist_joinsel_2d(internal, oid, internal, smallint)
 RETURNS double precision
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_joinsel_2d$function$

```


### gserialized_gist_joinsel_nd

- **Type**: function
- **Language**: c
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: internal, oid, internal, smallint
- **Returns**: double precision

```sql
CREATE OR REPLACE FUNCTION public.gserialized_gist_joinsel_nd(internal, oid, internal, smallint)
 RETURNS double precision
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$gserialized_gist_joinsel_nd$function$

```


### _postgis_deprecate

- **Type**: function
- **Language**: plpgsql
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: oldname text, newname text, version text
- **Returns**: void

```sql
CREATE OR REPLACE FUNCTION public._postgis_deprecate(oldname text, newname text, version text)
 RETURNS void
 LANGUAGE plpgsql
 IMMUTABLE STRICT COST 500
AS $function$
DECLARE
  curver_text text;
BEGIN
  --
  -- Raises a NOTICE if it was deprecated in this version,
  -- a WARNING if in a previous version (only up to minor version checked)
  --
	curver_text := '3.3.2';
	IF pg_catalog.split_part(curver_text,'.',1)::int > pg_catalog.split_part(version,'.',1)::int OR
	   ( pg_catalog.split_part(curver_text,'.',1) = pg_catalog.split_part(version,'.',1) AND
		 pg_catalog.split_part(curver_text,'.',2) != split_part(version,'.',2) )
	THEN
	  RAISE WARNING '% signature was deprecated in %. Please use %', oldname, version, newname;
	ELSE
	  RAISE DEBUG '% signature was deprecated in %. Please use %', oldname, version, newname;
	END IF;
END;
$function$

```


### spheroid_in

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: cstring
- **Returns**: spheroid

```sql
CREATE OR REPLACE FUNCTION public.spheroid_in(cstring)
 RETURNS spheroid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$ellipsoid_in$function$

```


### spheroid_out

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: spheroid
- **Returns**: cstring

```sql
CREATE OR REPLACE FUNCTION public.spheroid_out(spheroid)
 RETURNS cstring
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$ellipsoid_out$function$

```


### geometry

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geometry, integer, boolean
- **Returns**: geometry

```sql
CREATE OR REPLACE FUNCTION public.geometry(geometry, integer, boolean)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geometry_enforce_typmod$function$

```


### geometry

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: point
- **Returns**: geometry

```sql
CREATE OR REPLACE FUNCTION public.geometry(point)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$point_to_geometry$function$

```


### postgis_getbbox

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geometry
- **Returns**: box2d

```sql
CREATE OR REPLACE FUNCTION public.postgis_getbbox(geometry)
 RETURNS box2d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_to_BOX2DF$function$

```


### postgis_addbbox

args: geomA - Add bounding box to the geometry.

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geometry
- **Returns**: geometry

```sql
CREATE OR REPLACE FUNCTION public.postgis_addbbox(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_addBBOX$function$

```


### postgis_dropbbox

args: geomA - Drop the bounding box cache from the geometry.

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geometry
- **Returns**: geometry

```sql
CREATE OR REPLACE FUNCTION public.postgis_dropbbox(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_dropBBOX$function$

```


### postgis_hasbbox

args: geomA - Returns TRUE if the bbox of this geometry is cached, FALSE otherwise.

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geometry
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public.postgis_hasbbox(geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_hasBBOX$function$

```


### postgis_noop

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geometry
- **Returns**: geometry

```sql
CREATE OR REPLACE FUNCTION public.postgis_noop(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_noop$function$

```


### postgis_geos_noop

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geometry
- **Returns**: geometry

```sql
CREATE OR REPLACE FUNCTION public.postgis_geos_noop(geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$GEOSnoop$function$

```


### geomfromewkb

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: bytea
- **Returns**: geometry

```sql
CREATE OR REPLACE FUNCTION public.geomfromewkb(bytea)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOMFromEWKB$function$

```


### geomfromewkt

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: text
- **Returns**: geometry

```sql
CREATE OR REPLACE FUNCTION public.geomfromewkt(text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$parse_WKT_lwgeom$function$

```


### postgis_cache_bbox

- **Type**: function
- **Language**: c
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: 
- **Returns**: trigger

```sql
CREATE OR REPLACE FUNCTION public.postgis_cache_bbox()
 RETURNS trigger
 LANGUAGE c
AS '$libdir/postgis-3', $function$cache_bbox$function$

```


### populate_geometry_columns

args: use_typmod=true - Ensures geometry columns are defined with type modifiers or have appropriate spatial constraints.

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: use_typmod boolean DEFAULT true
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.populate_geometry_columns(use_typmod boolean DEFAULT true)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
	inserted	integer;
	oldcount	integer;
	probed	  integer;
	stale	   integer;
	gcs		 RECORD;
	gc		  RECORD;
	gsrid	   integer;
	gndims	  integer;
	gtype	   text;
	query	   text;
	gc_is_valid boolean;

BEGIN
	SELECT count(*) INTO oldcount FROM public.geometry_columns;
	inserted := 0;

	-- Count the number of geometry columns in all tables and views
	SELECT count(DISTINCT c.oid) INTO probed
	FROM pg_class c,
		 pg_attribute a,
		 pg_type t,
		 pg_namespace n
	WHERE c.relkind IN('r','v','f', 'p')
		AND t.typname = 'geometry'
		AND a.attisdropped = false
		AND a.atttypid = t.oid
		AND a.attrelid = c.oid
		AND c.relnamespace = n.oid
		AND n.nspname NOT ILIKE 'pg_temp%' AND c.relname != 'raster_columns' ;

	-- Iterate through all non-dropped geometry columns
	RAISE DEBUG 'Processing Tables.....';

	FOR gcs IN
	SELECT DISTINCT ON (c.oid) c.oid, n.nspname, c.relname
		FROM pg_class c,
			 pg_attribute a,
			 pg_type t,
			 pg_namespace n
		WHERE c.relkind IN( 'r', 'f', 'p')
		AND t.typname = 'geometry'
		AND a.attisdropped = false
		AND a.atttypid = t.oid
		AND a.attrelid = c.oid
		AND c.relnamespace = n.oid
		AND n.nspname NOT ILIKE 'pg_temp%' AND c.relname != 'raster_columns'
	LOOP

		inserted := inserted + public.populate_geometry_columns(gcs.oid, use_typmod);
	END LOOP;

	IF oldcount > inserted THEN
		stale = oldcount-inserted;
	ELSE
		stale = 0;
	END IF;

	RETURN 'probed:' ||probed|| ' inserted:'||inserted;
END

$function$

```


### populate_geometry_columns

args: relation_oid, use_typmod=true - Ensures geometry columns are defined with type modifiers or have appropriate spatial constraints.

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: tbl_oid oid, use_typmod boolean DEFAULT true
- **Returns**: integer

```sql
CREATE OR REPLACE FUNCTION public.populate_geometry_columns(tbl_oid oid, use_typmod boolean DEFAULT true)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
	gcs		 RECORD;
	gc		  RECORD;
	gc_old	  RECORD;
	gsrid	   integer;
	gndims	  integer;
	gtype	   text;
	query	   text;
	gc_is_valid boolean;
	inserted	integer;
	constraint_successful boolean := false;

BEGIN
	inserted := 0;

	-- Iterate through all geometry columns in this table
	FOR gcs IN
	SELECT n.nspname, c.relname, a.attname, c.relkind
		FROM pg_class c,
			 pg_attribute a,
			 pg_type t,
			 pg_namespace n
		WHERE c.relkind IN('r', 'f', 'p')
		AND t.typname = 'geometry'
		AND a.attisdropped = false
		AND a.atttypid = t.oid
		AND a.attrelid = c.oid
		AND c.relnamespace = n.oid
		AND n.nspname NOT ILIKE 'pg_temp%'
		AND c.oid = tbl_oid
	LOOP

		RAISE DEBUG 'Processing column %.%.%', gcs.nspname, gcs.relname, gcs.attname;

		gc_is_valid := true;
		-- Find the srid, coord_dimension, and type of current geometry
		-- in geometry_columns -- which is now a view

		SELECT type, srid, coord_dimension, gcs.relkind INTO gc_old
			FROM geometry_columns
			WHERE f_table_schema = gcs.nspname AND f_table_name = gcs.relname AND f_geometry_column = gcs.attname;

		IF upper(gc_old.type) = 'GEOMETRY' THEN
		-- This is an unconstrained geometry we need to do something
		-- We need to figure out what to set the type by inspecting the data
			EXECUTE 'SELECT public.ST_srid(' || quote_ident(gcs.attname) || ') As srid, public.GeometryType(' || quote_ident(gcs.attname) || ') As type, public.ST_NDims(' || quote_ident(gcs.attname) || ') As dims ' ||
					 ' FROM ONLY ' || quote_ident(gcs.nspname) || '.' || quote_ident(gcs.relname) ||
					 ' WHERE ' || quote_ident(gcs.attname) || ' IS NOT NULL LIMIT 1;'
				INTO gc;
			IF gc IS NULL THEN -- there is no data so we can not determine geometry type
				RAISE WARNING 'No data in table %.%, so no information to determine geometry type and srid', gcs.nspname, gcs.relname;
				RETURN 0;
			END IF;
			gsrid := gc.srid; gtype := gc.type; gndims := gc.dims;

			IF use_typmod THEN
				BEGIN
					EXECUTE 'ALTER TABLE ' || quote_ident(gcs.nspname) || '.' || quote_ident(gcs.relname) || ' ALTER COLUMN ' || quote_ident(gcs.attname) ||
						' TYPE geometry(' || postgis_type_name(gtype, gndims, true) || ', ' || gsrid::text  || ') ';
					inserted := inserted + 1;
				EXCEPTION
						WHEN invalid_parameter_value OR feature_not_supported THEN
						RAISE WARNING 'Could not convert ''%'' in ''%.%'' to use typmod with srid %, type %: %', quote_ident(gcs.attname), quote_ident(gcs.nspname), quote_ident(gcs.relname), gsrid, postgis_type_name(gtype, gndims, true), SQLERRM;
							gc_is_valid := false;
				END;

			ELSE
				-- Try to apply srid check to column
				constraint_successful = false;
				IF (gsrid > 0 AND postgis_constraint_srid(gcs.nspname, gcs.relname,gcs.attname) IS NULL ) THEN
					BEGIN
						EXECUTE 'ALTER TABLE ONLY ' || quote_ident(gcs.nspname) || '.' || quote_ident(gcs.relname) ||
								 ' ADD CONSTRAINT ' || quote_ident('enforce_srid_' || gcs.attname) ||
								 ' CHECK (ST_srid(' || quote_ident(gcs.attname) || ') = ' || gsrid || ')';
						constraint_successful := true;
					EXCEPTION
						WHEN check_violation THEN
							RAISE WARNING 'Not inserting ''%'' in ''%.%'' into geometry_columns: could not apply constraint CHECK (st_srid(%) = %)', quote_ident(gcs.attname), quote_ident(gcs.nspname), quote_ident(gcs.relname), quote_ident(gcs.attname), gsrid;
							gc_is_valid := false;
					END;
				END IF;

				-- Try to apply ndims check to column
				IF (gndims IS NOT NULL AND postgis_constraint_dims(gcs.nspname, gcs.relname,gcs.attname) IS NULL ) THEN
					BEGIN
						EXECUTE 'ALTER TABLE ONLY ' || quote_ident(gcs.nspname) || '.' || quote_ident(gcs.relname) || '
								 ADD CONSTRAINT ' || quote_ident('enforce_dims_' || gcs.attname) || '
								 CHECK (st_ndims(' || quote_ident(gcs.attname) || ') = '||gndims||')';
						constraint_successful := true;
					EXCEPTION
						WHEN check_violation THEN
							RAISE WARNING 'Not inserting ''%'' in ''%.%'' into geometry_columns: could not apply constraint CHECK (st_ndims(%) = %)', quote_ident(gcs.attname), quote_ident(gcs.nspname), quote_ident(gcs.relname), quote_ident(gcs.attname), gndims;
							gc_is_valid := false;
					END;
				END IF;

				-- Try to apply geometrytype check to column
				IF (gtype IS NOT NULL AND postgis_constraint_type(gcs.nspname, gcs.relname,gcs.attname) IS NULL ) THEN
					BEGIN
						EXECUTE 'ALTER TABLE ONLY ' || quote_ident(gcs.nspname) || '.' || quote_ident(gcs.relname) || '
						ADD CONSTRAINT ' || quote_ident('enforce_geotype_' || gcs.attname) || '
						CHECK (geometrytype(' || quote_ident(gcs.attname) || ') = ' || quote_literal(gtype) || ')';
						constraint_successful := true;
					EXCEPTION
						WHEN check_violation THEN
							-- No geometry check can be applied. This column contains a number of geometry types.
							RAISE WARNING 'Could not add geometry type check (%) to table column: %.%.%', gtype, quote_ident(gcs.nspname),quote_ident(gcs.relname),quote_ident(gcs.attname);
					END;
				END IF;
				 --only count if we were successful in applying at least one constraint
				IF constraint_successful THEN
					inserted := inserted + 1;
				END IF;
			END IF;
		END IF;

	END LOOP;

	RETURN inserted;
END

$function$

```


### addgeometrycolumn

args: catalog_name, schema_name, table_name, column_name, srid, type, dimension, use_typmod=true - Adds a geometry column to an existing table.

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: catalog_name character varying, schema_name character varying, table_name character varying, column_name character varying, new_srid_in integer, new_type character varying, new_dim integer, use_typmod boolean DEFAULT true
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.addgeometrycolumn(catalog_name character varying, schema_name character varying, table_name character varying, column_name character varying, new_srid_in integer, new_type character varying, new_dim integer, use_typmod boolean DEFAULT true)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	rec RECORD;
	sr varchar;
	real_schema name;
	sql text;
	new_srid integer;

BEGIN

	-- Verify geometry type
	IF (postgis_type_name(new_type,new_dim) IS NULL )
	THEN
		RAISE EXCEPTION 'Invalid type name "%(%)" - valid ones are:
	POINT, MULTIPOINT,
	LINESTRING, MULTILINESTRING,
	POLYGON, MULTIPOLYGON,
	CIRCULARSTRING, COMPOUNDCURVE, MULTICURVE,
	CURVEPOLYGON, MULTISURFACE,
	GEOMETRY, GEOMETRYCOLLECTION,
	POINTM, MULTIPOINTM,
	LINESTRINGM, MULTILINESTRINGM,
	POLYGONM, MULTIPOLYGONM,
	CIRCULARSTRINGM, COMPOUNDCURVEM, MULTICURVEM
	CURVEPOLYGONM, MULTISURFACEM, TRIANGLE, TRIANGLEM,
	POLYHEDRALSURFACE, POLYHEDRALSURFACEM, TIN, TINM
	or GEOMETRYCOLLECTIONM', new_type, new_dim;
		RETURN 'fail';
	END IF;

	-- Verify dimension
	IF ( (new_dim >4) OR (new_dim <2) ) THEN
		RAISE EXCEPTION 'invalid dimension';
		RETURN 'fail';
	END IF;

	IF ( (new_type LIKE '%M') AND (new_dim!=3) ) THEN
		RAISE EXCEPTION 'TypeM needs 3 dimensions';
		RETURN 'fail';
	END IF;

	-- Verify SRID
	IF ( new_srid_in > 0 ) THEN
		IF new_srid_in > 998999 THEN
			RAISE EXCEPTION 'AddGeometryColumn() - SRID must be <= %', 998999;
		END IF;
		new_srid := new_srid_in;
		SELECT SRID INTO sr FROM spatial_ref_sys WHERE SRID = new_srid;
		IF NOT FOUND THEN
			RAISE EXCEPTION 'AddGeometryColumn() - invalid SRID';
			RETURN 'fail';
		END IF;
	ELSE
		new_srid := public.ST_SRID('POINT EMPTY'::public.geometry);
		IF ( new_srid_in != new_srid ) THEN
			RAISE NOTICE 'SRID value % converted to the officially unknown SRID value %', new_srid_in, new_srid;
		END IF;
	END IF;

	-- Verify schema
	IF ( schema_name IS NOT NULL AND schema_name != '' ) THEN
		sql := 'SELECT nspname FROM pg_namespace ' ||
			'WHERE text(nspname) = ' || quote_literal(schema_name) ||
			'LIMIT 1';
		RAISE DEBUG '%', sql;
		EXECUTE sql INTO real_schema;

		IF ( real_schema IS NULL ) THEN
			RAISE EXCEPTION 'Schema % is not a valid schemaname', quote_literal(schema_name);
			RETURN 'fail';
		END IF;
	END IF;

	IF ( real_schema IS NULL ) THEN
		RAISE DEBUG 'Detecting schema';
		sql := 'SELECT n.nspname AS schemaname ' ||
			'FROM pg_catalog.pg_class c ' ||
			  'JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace ' ||
			'WHERE c.relkind = ' || quote_literal('r') ||
			' AND n.nspname NOT IN (' || quote_literal('pg_catalog') || ', ' || quote_literal('pg_toast') || ')' ||
			' AND pg_catalog.pg_table_is_visible(c.oid)' ||
			' AND c.relname = ' || quote_literal(table_name);
		RAISE DEBUG '%', sql;
		EXECUTE sql INTO real_schema;

		IF ( real_schema IS NULL ) THEN
			RAISE EXCEPTION 'Table % does not occur in the search_path', quote_literal(table_name);
			RETURN 'fail';
		END IF;
	END IF;

	-- Add geometry column to table
	IF use_typmod THEN
		 sql := 'ALTER TABLE ' ||
			quote_ident(real_schema) || '.' || quote_ident(table_name)
			|| ' ADD COLUMN ' || quote_ident(column_name) ||
			' geometry(' || public.postgis_type_name(new_type, new_dim) || ', ' || new_srid::text || ')';
		RAISE DEBUG '%', sql;
	ELSE
		sql := 'ALTER TABLE ' ||
			quote_ident(real_schema) || '.' || quote_ident(table_name)
			|| ' ADD COLUMN ' || quote_ident(column_name) ||
			' geometry ';
		RAISE DEBUG '%', sql;
	END IF;
	EXECUTE sql;

	IF NOT use_typmod THEN
		-- Add table CHECKs
		sql := 'ALTER TABLE ' ||
			quote_ident(real_schema) || '.' || quote_ident(table_name)
			|| ' ADD CONSTRAINT '
			|| quote_ident('enforce_srid_' || column_name)
			|| ' CHECK (st_srid(' || quote_ident(column_name) ||
			') = ' || new_srid::text || ')' ;
		RAISE DEBUG '%', sql;
		EXECUTE sql;

		sql := 'ALTER TABLE ' ||
			quote_ident(real_schema) || '.' || quote_ident(table_name)
			|| ' ADD CONSTRAINT '
			|| quote_ident('enforce_dims_' || column_name)
			|| ' CHECK (st_ndims(' || quote_ident(column_name) ||
			') = ' || new_dim::text || ')' ;
		RAISE DEBUG '%', sql;
		EXECUTE sql;

		IF ( NOT (new_type = 'GEOMETRY')) THEN
			sql := 'ALTER TABLE ' ||
				quote_ident(real_schema) || '.' || quote_ident(table_name) || ' ADD CONSTRAINT ' ||
				quote_ident('enforce_geotype_' || column_name) ||
				' CHECK (GeometryType(' ||
				quote_ident(column_name) || ')=' ||
				quote_literal(new_type) || ' OR (' ||
				quote_ident(column_name) || ') is null)';
			RAISE DEBUG '%', sql;
			EXECUTE sql;
		END IF;
	END IF;

	RETURN
		real_schema || '.' ||
		table_name || '.' || column_name ||
		' SRID:' || new_srid::text ||
		' TYPE:' || new_type ||
		' DIMS:' || new_dim::text || ' ';
END;
$function$

```


### addgeometrycolumn

args: schema_name, table_name, column_name, srid, type, dimension, use_typmod=true - Adds a geometry column to an existing table.

- **Type**: function
- **Language**: plpgsql
- **Volatility**: stable
- **Security Definer**: No
- **Arguments**: schema_name character varying, table_name character varying, column_name character varying, new_srid integer, new_type character varying, new_dim integer, use_typmod boolean DEFAULT true
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.addgeometrycolumn(schema_name character varying, table_name character varying, column_name character varying, new_srid integer, new_type character varying, new_dim integer, use_typmod boolean DEFAULT true)
 RETURNS text
 LANGUAGE plpgsql
 STABLE STRICT
AS $function$
DECLARE
	ret  text;
BEGIN
	SELECT public.AddGeometryColumn('',$1,$2,$3,$4,$5,$6,$7) into ret;
	RETURN ret;
END;
$function$

```


### addgeometrycolumn

args: table_name, column_name, srid, type, dimension, use_typmod=true - Adds a geometry column to an existing table.

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: table_name character varying, column_name character varying, new_srid integer, new_type character varying, new_dim integer, use_typmod boolean DEFAULT true
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.addgeometrycolumn(table_name character varying, column_name character varying, new_srid integer, new_type character varying, new_dim integer, use_typmod boolean DEFAULT true)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	ret  text;
BEGIN
	SELECT public.AddGeometryColumn('','',$1,$2,$3,$4,$5, $6) into ret;
	RETURN ret;
END;
$function$

```


### dropgeometrycolumn

args: catalog_name, schema_name, table_name, column_name - Removes a geometry column from a spatial table.

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: catalog_name character varying, schema_name character varying, table_name character varying, column_name character varying
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.dropgeometrycolumn(catalog_name character varying, schema_name character varying, table_name character varying, column_name character varying)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	myrec RECORD;
	okay boolean;
	real_schema name;

BEGIN

	-- Find, check or fix schema_name
	IF ( schema_name != '' ) THEN
		okay = false;

		FOR myrec IN SELECT nspname FROM pg_namespace WHERE text(nspname) = schema_name LOOP
			okay := true;
		END LOOP;

		IF ( okay <>  true ) THEN
			RAISE NOTICE 'Invalid schema name - using current_schema()';
			SELECT current_schema() into real_schema;
		ELSE
			real_schema = schema_name;
		END IF;
	ELSE
		SELECT current_schema() into real_schema;
	END IF;

	-- Find out if the column is in the geometry_columns table
	okay = false;
	FOR myrec IN SELECT * from public.geometry_columns where f_table_schema = text(real_schema) and f_table_name = table_name and f_geometry_column = column_name LOOP
		okay := true;
	END LOOP;
	IF (okay <> true) THEN
		RAISE EXCEPTION 'column not found in geometry_columns table';
		RETURN false;
	END IF;

	-- Remove table column
	EXECUTE 'ALTER TABLE ' || quote_ident(real_schema) || '.' ||
		quote_ident(table_name) || ' DROP COLUMN ' ||
		quote_ident(column_name);

	RETURN real_schema || '.' || table_name || '.' || column_name ||' effectively removed.';

END;
$function$

```


### dropgeometrycolumn

args: schema_name, table_name, column_name - Removes a geometry column from a spatial table.

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: schema_name character varying, table_name character varying, column_name character varying
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.dropgeometrycolumn(schema_name character varying, table_name character varying, column_name character varying)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	ret text;
BEGIN
	SELECT public.DropGeometryColumn('',$1,$2,$3) into ret;
	RETURN ret;
END;
$function$

```


### dropgeometrycolumn

args: table_name, column_name - Removes a geometry column from a spatial table.

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: table_name character varying, column_name character varying
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.dropgeometrycolumn(table_name character varying, column_name character varying)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	ret text;
BEGIN
	SELECT public.DropGeometryColumn('','',$1,$2) into ret;
	RETURN ret;
END;
$function$

```


### postgis_version

Returns PostGIS version number and compile-time options.

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: 
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.postgis_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_version$function$

```


### dropgeometrytable

args: catalog_name, schema_name, table_name - Drops a table and all its references in geometry_columns.

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: catalog_name character varying, schema_name character varying, table_name character varying
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.dropgeometrytable(catalog_name character varying, schema_name character varying, table_name character varying)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	real_schema name;

BEGIN

	IF ( schema_name = '' ) THEN
		SELECT current_schema() into real_schema;
	ELSE
		real_schema = schema_name;
	END IF;

	-- TODO: Should we warn if table doesn't exist probably instead just saying dropped
	-- Remove table
	EXECUTE 'DROP TABLE IF EXISTS '
		|| quote_ident(real_schema) || '.' ||
		quote_ident(table_name) || ' RESTRICT';

	RETURN
		real_schema || '.' ||
		table_name ||' dropped.';

END;
$function$

```


### dropgeometrytable

args: schema_name, table_name - Drops a table and all its references in geometry_columns.

- **Type**: function
- **Language**: sql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: schema_name character varying, table_name character varying
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.dropgeometrytable(schema_name character varying, table_name character varying)
 RETURNS text
 LANGUAGE sql
 STRICT
AS $function$ SELECT public.DropGeometryTable('',$1,$2) $function$

```


### dropgeometrytable

args: table_name - Drops a table and all its references in geometry_columns.

- **Type**: function
- **Language**: sql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: table_name character varying
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.dropgeometrytable(table_name character varying)
 RETURNS text
 LANGUAGE sql
 STRICT
AS $function$ SELECT public.DropGeometryTable('','',$1) $function$

```


### updategeometrysrid

args: catalog_name, schema_name, table_name, column_name, srid - Updates the SRID of all features in a geometry column, and the table metadata.

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: catalogn_name character varying, schema_name character varying, table_name character varying, column_name character varying, new_srid_in integer
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.updategeometrysrid(catalogn_name character varying, schema_name character varying, table_name character varying, column_name character varying, new_srid_in integer)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	myrec RECORD;
	okay boolean;
	cname varchar;
	real_schema name;
	unknown_srid integer;
	new_srid integer := new_srid_in;

BEGIN

	-- Find, check or fix schema_name
	IF ( schema_name != '' ) THEN
		okay = false;

		FOR myrec IN SELECT nspname FROM pg_namespace WHERE text(nspname) = schema_name LOOP
			okay := true;
		END LOOP;

		IF ( okay <> true ) THEN
			RAISE EXCEPTION 'Invalid schema name';
		ELSE
			real_schema = schema_name;
		END IF;
	ELSE
		SELECT INTO real_schema current_schema()::text;
	END IF;

	-- Ensure that column_name is in geometry_columns
	okay = false;
	FOR myrec IN SELECT type, coord_dimension FROM public.geometry_columns WHERE f_table_schema = text(real_schema) and f_table_name = table_name and f_geometry_column = column_name LOOP
		okay := true;
	END LOOP;
	IF (NOT okay) THEN
		RAISE EXCEPTION 'column not found in geometry_columns table';
		RETURN false;
	END IF;

	-- Ensure that new_srid is valid
	IF ( new_srid > 0 ) THEN
		IF ( SELECT count(*) = 0 from spatial_ref_sys where srid = new_srid ) THEN
			RAISE EXCEPTION 'invalid SRID: % not found in spatial_ref_sys', new_srid;
			RETURN false;
		END IF;
	ELSE
		unknown_srid := public.ST_SRID('POINT EMPTY'::public.geometry);
		IF ( new_srid != unknown_srid ) THEN
			new_srid := unknown_srid;
			RAISE NOTICE 'SRID value % converted to the officially unknown SRID value %', new_srid_in, new_srid;
		END IF;
	END IF;

	IF postgis_constraint_srid(real_schema, table_name, column_name) IS NOT NULL THEN
	-- srid was enforced with constraints before, keep it that way.
		-- Make up constraint name
		cname = 'enforce_srid_'  || column_name;

		-- Drop enforce_srid constraint
		EXECUTE 'ALTER TABLE ' || quote_ident(real_schema) ||
			'.' || quote_ident(table_name) ||
			' DROP constraint ' || quote_ident(cname);

		-- Update geometries SRID
		EXECUTE 'UPDATE ' || quote_ident(real_schema) ||
			'.' || quote_ident(table_name) ||
			' SET ' || quote_ident(column_name) ||
			' = public.ST_SetSRID(' || quote_ident(column_name) ||
			', ' || new_srid::text || ')';

		-- Reset enforce_srid constraint
		EXECUTE 'ALTER TABLE ' || quote_ident(real_schema) ||
			'.' || quote_ident(table_name) ||
			' ADD constraint ' || quote_ident(cname) ||
			' CHECK (st_srid(' || quote_ident(column_name) ||
			') = ' || new_srid::text || ')';
	ELSE
		-- We will use typmod to enforce if no srid constraints
		-- We are using postgis_type_name to lookup the new name
		-- (in case Paul changes his mind and flips geometry_columns to return old upper case name)
		EXECUTE 'ALTER TABLE ' || quote_ident(real_schema) || '.' || quote_ident(table_name) ||
		' ALTER COLUMN ' || quote_ident(column_name) || ' TYPE  geometry(' || public.postgis_type_name(myrec.type, myrec.coord_dimension, true) || ', ' || new_srid::text || ') USING public.ST_SetSRID(' || quote_ident(column_name) || ',' || new_srid::text || ');' ;
	END IF;

	RETURN real_schema || '.' || table_name || '.' || column_name ||' SRID changed to ' || new_srid::text;

END;
$function$

```


### updategeometrysrid

args: schema_name, table_name, column_name, srid - Updates the SRID of all features in a geometry column, and the table metadata.

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: character varying, character varying, character varying, integer
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.updategeometrysrid(character varying, character varying, character varying, integer)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	ret  text;
BEGIN
	SELECT public.UpdateGeometrySRID('',$1,$2,$3,$4) into ret;
	RETURN ret;
END;
$function$

```


### updategeometrysrid

args: table_name, column_name, srid - Updates the SRID of all features in a geometry column, and the table metadata.

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: character varying, character varying, integer
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.updategeometrysrid(character varying, character varying, integer)
 RETURNS text
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	ret  text;
BEGIN
	SELECT public.UpdateGeometrySRID('','',$1,$2,$3) into ret;
	RETURN ret;
END;
$function$

```


### find_srid

args: a_schema_name, a_table_name, a_geomfield_name - Returns the SRID defined for a geometry column.

- **Type**: function
- **Language**: plpgsql
- **Volatility**: stable
- **Security Definer**: No
- **Arguments**: character varying, character varying, character varying
- **Returns**: integer

```sql
CREATE OR REPLACE FUNCTION public.find_srid(character varying, character varying, character varying)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE PARALLEL SAFE STRICT
AS $function$
DECLARE
	schem varchar =  $1;
	tabl varchar = $2;
	sr int4;
BEGIN
-- if the table contains a . and the schema is empty
-- split the table into a schema and a table
-- otherwise drop through to default behavior
	IF ( schem = '' and strpos(tabl,'.') > 0 ) THEN
	 schem = substr(tabl,1,strpos(tabl,'.')-1);
	 tabl = substr(tabl,length(schem)+2);
	END IF;

	select SRID into sr from public.geometry_columns where (f_table_schema = schem or schem = '') and f_table_name = tabl and f_geometry_column = $3;
	IF NOT FOUND THEN
	   RAISE EXCEPTION 'find_srid() - could not find the corresponding SRID - is the geometry registered in the GEOMETRY_COLUMNS table?  Is there an uppercase/lowercase mismatch?';
	END IF;
	return sr;
END;
$function$

```


### get_proj4_from_srid

- **Type**: function
- **Language**: plpgsql
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: integer
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.get_proj4_from_srid(integer)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
	BEGIN
	RETURN proj4text::text FROM public.spatial_ref_sys WHERE srid= $1;
	END;
	$function$

```


### postgis_transform_geometry

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geom geometry, text, text, integer
- **Returns**: geometry

```sql
CREATE OR REPLACE FUNCTION public.postgis_transform_geometry(geom geometry, text, text, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$transform_geom$function$

```


### postgis_liblwgeom_version

Returns the version number of the liblwgeom library. This should match the version of PostGIS.

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: 
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.postgis_liblwgeom_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_liblwgeom_version$function$

```


### postgis_proj_version

Returns the version number of the PROJ4 library.

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: 
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.postgis_proj_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_proj_version$function$

```


### postgis_wagyu_version

Returns the version number of the internal Wagyu library.

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: 
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.postgis_wagyu_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_wagyu_version$function$

```


### postgis_scripts_installed

Returns version of the PostGIS scripts installed in this database.

- **Type**: function
- **Language**: sql
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: 
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.postgis_scripts_installed()
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$ SELECT trim('3.3.2'::text || $rev$ 4975da8 $rev$) AS version $function$

```


### postgis_lib_version

Returns the version number of the PostGIS library.

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: 
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.postgis_lib_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_lib_version$function$

```


### postgis_scripts_released

Returns the version number of the postgis.sql script released with the installed PostGIS lib.

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: 
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.postgis_scripts_released()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_scripts_released$function$

```


### postgis_geos_version

Returns the version number of the GEOS library.

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: 
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.postgis_geos_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_geos_version$function$

```


### postgis_lib_revision

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: 
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.postgis_lib_revision()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_lib_revision$function$

```


### postgis_svn_version

- **Type**: function
- **Language**: sql
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: 
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.postgis_svn_version()
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
	SELECT public._postgis_deprecate(
		'postgis_svn_version', 'postgis_lib_revision', '3.1.0');
	SELECT public.postgis_lib_revision();
$function$

```


### postgis_libxml_version

Returns the version number of the libxml2 library.

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: 
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.postgis_libxml_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_libxml_version$function$

```


### postgis_scripts_build_date

Returns build date of the PostGIS scripts.

- **Type**: function
- **Language**: sql
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: 
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.postgis_scripts_build_date()
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$SELECT '2022-11-13 07:09:50'::text AS version$function$

```


### postgis_lib_build_date

Returns build date of the PostGIS library.

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: 
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.postgis_lib_build_date()
 RETURNS text
 LANGUAGE c
 IMMUTABLE
AS '$libdir/postgis-3', $function$postgis_lib_build_date$function$

```


### _postgis_scripts_pgsql_version

- **Type**: function
- **Language**: sql
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: 
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public._postgis_scripts_pgsql_version()
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$SELECT '150'::text AS version$function$

```


### _postgis_pgsql_version

- **Type**: function
- **Language**: sql
- **Volatility**: stable
- **Security Definer**: No
- **Arguments**: 
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public._postgis_pgsql_version()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
	SELECT CASE WHEN pg_catalog.split_part(s,'.',1)::integer > 9 THEN pg_catalog.split_part(s,'.',1) || '0'
	ELSE pg_catalog.split_part(s,'.', 1) || pg_catalog.split_part(s,'.', 2) END AS v
	FROM pg_catalog.substring(version(), 'PostgreSQL ([0-9\.]+)') AS s;
$function$

```


### postgis_extensions_upgrade

Packages and upgrades PostGIS extensions (e.g. postgis_raster,postgis_topology, postgis_sfcgal) to latest available version.

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: 
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.postgis_extensions_upgrade()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
	rec record;
	sql text;
	var_schema text;
	target_version text; -- TODO: optionally take as argument
BEGIN

	FOR rec IN
		SELECT name, default_version, installed_version
		FROM pg_catalog.pg_available_extensions
		WHERE name IN (
			'postgis',
			'postgis_raster',
			'postgis_sfcgal',
			'postgis_topology',
			'postgis_tiger_geocoder'
		)
		ORDER BY length(name) -- this is to make sure 'postgis' is first !
	LOOP --{

		IF target_version IS NULL THEN
			target_version := rec.default_version;
		END IF;

		IF rec.installed_version IS NULL THEN --{
			-- If the support installed by available extension
			-- is found unpackaged, we package it
			IF --{
				 -- PostGIS is always available (this function is part of it)
				 rec.name = 'postgis'

				 -- PostGIS raster is available if type 'raster' exists
				 OR ( rec.name = 'postgis_raster' AND EXISTS (
							SELECT 1 FROM pg_catalog.pg_type
							WHERE typname = 'raster' ) )

				 -- PostGIS SFCGAL is availble if
				 -- 'postgis_sfcgal_version' function exists
				 OR ( rec.name = 'postgis_sfcgal' AND EXISTS (
							SELECT 1 FROM pg_catalog.pg_proc
							WHERE proname = 'postgis_sfcgal_version' ) )

				 -- PostGIS Topology is available if
				 -- 'topology.topology' table exists
				 -- NOTE: watch out for https://trac.osgeo.org/postgis/ticket/2503
				 OR ( rec.name = 'postgis_topology' AND EXISTS (
							SELECT 1 FROM pg_catalog.pg_class c
							JOIN pg_catalog.pg_namespace n ON (c.relnamespace = n.oid )
							WHERE n.nspname = 'topology' AND c.relname = 'topology') )

				 OR ( rec.name = 'postgis_tiger_geocoder' AND EXISTS (
							SELECT 1 FROM pg_catalog.pg_class c
							JOIN pg_catalog.pg_namespace n ON (c.relnamespace = n.oid )
							WHERE n.nspname = 'tiger' AND c.relname = 'geocode_settings') )
			THEN --}{
				-- Force install in same schema as postgis
				SELECT INTO var_schema n.nspname
				  FROM pg_namespace n, pg_proc p
				  WHERE p.proname = 'postgis_full_version'
					AND n.oid = p.pronamespace
				  LIMIT 1;
				IF rec.name NOT IN('postgis_topology', 'postgis_tiger_geocoder')
				THEN
					sql := format(
							  'CREATE EXTENSION %1$I SCHEMA %2$I VERSION unpackaged;'
							  'ALTER EXTENSION %1$I UPDATE TO %3$I',
							  rec.name, var_schema, target_version);
				ELSE
					sql := format(
							 'CREATE EXTENSION %1$I VERSION unpackaged;'
							 'ALTER EXTENSION %1$I UPDATE TO %2$I',
							 rec.name, target_version);
				END IF;
				RAISE NOTICE 'Packaging and updating %', rec.name;
				RAISE DEBUG '%', sql;
				EXECUTE sql;
			ELSE
				RAISE DEBUG 'Skipping % (not in use)', rec.name;
			END IF;
		ELSE -- IF target_version != rec.installed_version THEN --}{
			sql = '';
			-- If logged in as super user
			-- force an update regardless if at target version, no downgrade allowed
			IF (SELECT usesuper FROM pg_user WHERE usename = CURRENT_USER)
						AND pg_catalog.substring(target_version, '[0-9]+\.[0-9]+\.[0-9]+')
								>= pg_catalog.substring(rec.installed_version, '[0-9]+\.[0-9]+\.[0-9]+')
			THEN
				sql = format(
					'UPDATE pg_catalog.pg_extension SET extversion = ''ANY'' WHERE extname = %1$L;'
					'ALTER EXTENSION %1$I UPDATE TO %2$I',
					rec.name, target_version
				);
			-- sandboxed users do standard upgrade
			ELSE
				sql = format(
				'ALTER EXTENSION %1$I UPDATE TO %2$I',
				rec.name, target_version
				);
			END IF;
			RAISE NOTICE 'Updating extension % %',
				rec.name, rec.installed_version;
			RAISE DEBUG '%', sql;
			EXECUTE sql;
		END IF; --}

	END LOOP; --}

	RETURN format(
		'Upgrade to version %s completed, run SELECT postgis_full_version(); for details',
		target_version
	);


END
$function$

```


### postgis_full_version

Reports full PostGIS version and build configuration infos.

- **Type**: function
- **Language**: plpgsql
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: 
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.postgis_full_version()
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
DECLARE
	libver text;
	librev text;
	projver text;
	geosver text;
	sfcgalver text;
	gdalver text := NULL;
	libxmlver text;
	liblwgeomver text;
	dbproc text;
	relproc text;
	fullver text;
	rast_lib_ver text := NULL;
	rast_scr_ver text := NULL;
	topo_scr_ver text := NULL;
	json_lib_ver text;
	protobuf_lib_ver text;
	wagyu_lib_ver text;
	sfcgal_lib_ver text;
	sfcgal_scr_ver text;
	pgsql_scr_ver text;
	pgsql_ver text;
	core_is_extension bool;
BEGIN
	SELECT public.postgis_lib_version() INTO libver;
	SELECT public.postgis_proj_version() INTO projver;
	SELECT public.postgis_geos_version() INTO geosver;
	SELECT public.postgis_libjson_version() INTO json_lib_ver;
	SELECT public.postgis_libprotobuf_version() INTO protobuf_lib_ver;
	SELECT public.postgis_wagyu_version() INTO wagyu_lib_ver;
	SELECT public._postgis_scripts_pgsql_version() INTO pgsql_scr_ver;
	SELECT public._postgis_pgsql_version() INTO pgsql_ver;
	BEGIN
		SELECT public.postgis_gdal_version() INTO gdalver;
	EXCEPTION
		WHEN undefined_function THEN
			RAISE DEBUG 'Function postgis_gdal_version() not found.  Is raster support enabled and rtpostgis.sql installed?';
	END;
	BEGIN
		SELECT public.postgis_sfcgal_full_version() INTO sfcgalver;
		BEGIN
			SELECT public.postgis_sfcgal_scripts_installed() INTO sfcgal_scr_ver;
		EXCEPTION
			WHEN undefined_function THEN
				sfcgal_scr_ver := 'missing';
		END;
	EXCEPTION
		WHEN undefined_function THEN
			RAISE DEBUG 'Function postgis_sfcgal_scripts_installed() not found. Is sfcgal support enabled and sfcgal.sql installed?';
	END;
	SELECT public.postgis_liblwgeom_version() INTO liblwgeomver;
	SELECT public.postgis_libxml_version() INTO libxmlver;
	SELECT public.postgis_scripts_installed() INTO dbproc;
	SELECT public.postgis_scripts_released() INTO relproc;
	SELECT public.postgis_lib_revision() INTO librev;
	BEGIN
		SELECT topology.postgis_topology_scripts_installed() INTO topo_scr_ver;
	EXCEPTION
		WHEN undefined_function OR invalid_schema_name THEN
			RAISE DEBUG 'Function postgis_topology_scripts_installed() not found. Is topology support enabled and topology.sql installed?';
		WHEN insufficient_privilege THEN
			RAISE NOTICE 'Topology support cannot be inspected. Is current user granted USAGE on schema "topology" ?';
		WHEN OTHERS THEN
			RAISE NOTICE 'Function postgis_topology_scripts_installed() could not be called: % (%)', SQLERRM, SQLSTATE;
	END;

	BEGIN
		SELECT postgis_raster_scripts_installed() INTO rast_scr_ver;
	EXCEPTION
		WHEN undefined_function THEN
			RAISE DEBUG 'Function postgis_raster_scripts_installed() not found. Is raster support enabled and rtpostgis.sql installed?';
		WHEN OTHERS THEN
			RAISE NOTICE 'Function postgis_raster_scripts_installed() could not be called: % (%)', SQLERRM, SQLSTATE;
	END;

	BEGIN
		SELECT public.postgis_raster_lib_version() INTO rast_lib_ver;
	EXCEPTION
		WHEN undefined_function THEN
			RAISE DEBUG 'Function postgis_raster_lib_version() not found. Is raster support enabled and rtpostgis.sql installed?';
		WHEN OTHERS THEN
			RAISE NOTICE 'Function postgis_raster_lib_version() could not be called: % (%)', SQLERRM, SQLSTATE;
	END;

	fullver = 'POSTGIS="' || libver;

	IF  librev IS NOT NULL THEN
		fullver = fullver || ' ' || librev;
	END IF;

	fullver = fullver || '"';

	IF EXISTS (
		SELECT * FROM pg_catalog.pg_extension
		WHERE extname = 'postgis')
	THEN
			fullver = fullver || ' [EXTENSION]';
			core_is_extension := true;
	ELSE
			core_is_extension := false;
	END IF;

	IF liblwgeomver != relproc THEN
		fullver = fullver || ' (liblwgeom version mismatch: "' || liblwgeomver || '")';
	END IF;

	fullver = fullver || ' PGSQL="' || pgsql_scr_ver || '"';
	IF pgsql_scr_ver != pgsql_ver THEN
		fullver = fullver || ' (procs need upgrade for use with PostgreSQL "' || pgsql_ver || '")';
	END IF;

	IF  geosver IS NOT NULL THEN
		fullver = fullver || ' GEOS="' || geosver || '"';
	END IF;

	IF  sfcgalver IS NOT NULL THEN
		fullver = fullver || ' SFCGAL="' || sfcgalver || '"';
	END IF;

	IF  projver IS NOT NULL THEN
		fullver = fullver || ' PROJ="' || projver || '"';
	END IF;

	IF  gdalver IS NOT NULL THEN
		fullver = fullver || ' GDAL="' || gdalver || '"';
	END IF;

	IF  libxmlver IS NOT NULL THEN
		fullver = fullver || ' LIBXML="' || libxmlver || '"';
	END IF;

	IF json_lib_ver IS NOT NULL THEN
		fullver = fullver || ' LIBJSON="' || json_lib_ver || '"';
	END IF;

	IF protobuf_lib_ver IS NOT NULL THEN
		fullver = fullver || ' LIBPROTOBUF="' || protobuf_lib_ver || '"';
	END IF;

	IF wagyu_lib_ver IS NOT NULL THEN
		fullver = fullver || ' WAGYU="' || wagyu_lib_ver || '"';
	END IF;

	IF dbproc != relproc THEN
		fullver = fullver || ' (core procs from "' || dbproc || '" need upgrade)';
	END IF;

	IF topo_scr_ver IS NOT NULL THEN
		fullver = fullver || ' TOPOLOGY';
		IF topo_scr_ver != relproc THEN
			fullver = fullver || ' (topology procs from "' || topo_scr_ver || '" need upgrade)';
		END IF;
		IF core_is_extension AND NOT EXISTS (
			SELECT * FROM pg_catalog.pg_extension
			WHERE extname = 'postgis_topology')
		THEN
				fullver = fullver || ' [UNPACKAGED!]';
		END IF;
	END IF;

	IF rast_lib_ver IS NOT NULL THEN
		fullver = fullver || ' RASTER';
		IF rast_lib_ver != relproc THEN
			fullver = fullver || ' (raster lib from "' || rast_lib_ver || '" need upgrade)';
		END IF;
		IF core_is_extension AND NOT EXISTS (
			SELECT * FROM pg_catalog.pg_extension
			WHERE extname = 'postgis_raster')
		THEN
				fullver = fullver || ' [UNPACKAGED!]';
		END IF;
	END IF;

	IF rast_scr_ver IS NOT NULL AND rast_scr_ver != relproc THEN
		fullver = fullver || ' (raster procs from "' || rast_scr_ver || '" need upgrade)';
	END IF;

	IF sfcgal_scr_ver IS NOT NULL AND sfcgal_scr_ver != relproc THEN
		fullver = fullver || ' (sfcgal procs from "' || sfcgal_scr_ver || '" need upgrade)';
	END IF;

	-- Check for the presence of deprecated functions
	IF EXISTS ( SELECT oid FROM pg_catalog.pg_proc WHERE proname LIKE '%_deprecated_by_postgis_%' )
	THEN
		fullver = fullver || ' (deprecated functions exist, upgrade is not complete)';
	END IF;

	RETURN fullver;
END
$function$

```


### box2d

args: geom - Returns a BOX2D representing the 2D extent of a geometry.

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geometry
- **Returns**: box2d

```sql
CREATE OR REPLACE FUNCTION public.box2d(geometry)
 RETURNS box2d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_to_BOX2D$function$

```


### box3d

args: geom - Returns a BOX3D representing the 3D extent of a geometry.

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geometry
- **Returns**: box3d

```sql
CREATE OR REPLACE FUNCTION public.box3d(geometry)
 RETURNS box3d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_to_BOX3D$function$

```


### box

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geometry
- **Returns**: box

```sql
CREATE OR REPLACE FUNCTION public.box(geometry)
 RETURNS box
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_to_BOX$function$

```


### box2d

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: box3d
- **Returns**: box2d

```sql
CREATE OR REPLACE FUNCTION public.box2d(box3d)
 RETURNS box2d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX3D_to_BOX2D$function$

```


### box3d

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: box2d
- **Returns**: box3d

```sql
CREATE OR REPLACE FUNCTION public.box3d(box2d)
 RETURNS box3d
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX2D_to_BOX3D$function$

```


### box

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: box3d
- **Returns**: box

```sql
CREATE OR REPLACE FUNCTION public.box(box3d)
 RETURNS box
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX3D_to_BOX$function$

```


### text

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geometry
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.text(geometry)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_to_text$function$

```


### box3dtobox

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: box3d
- **Returns**: box

```sql
CREATE OR REPLACE FUNCTION public.box3dtobox(box3d)
 RETURNS box
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX3D_to_BOX$function$

```


### geometry

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: box2d
- **Returns**: geometry

```sql
CREATE OR REPLACE FUNCTION public.geometry(box2d)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX2D_to_LWGEOM$function$

```


### geometry

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: box3d
- **Returns**: geometry

```sql
CREATE OR REPLACE FUNCTION public.geometry(box3d)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$BOX3D_to_LWGEOM$function$

```


### geometry

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: text
- **Returns**: geometry

```sql
CREATE OR REPLACE FUNCTION public.geometry(text)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$parse_WKT_lwgeom$function$

```


### geometry

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: bytea
- **Returns**: geometry

```sql
CREATE OR REPLACE FUNCTION public.geometry(bytea)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_from_bytea$function$

```


### bytea

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geometry
- **Returns**: bytea

```sql
CREATE OR REPLACE FUNCTION public.bytea(geometry)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$LWGEOM_to_bytea$function$

```


### _st_voronoi

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: g1 geometry, clip geometry DEFAULT NULL::geometry, tolerance double precision DEFAULT 0.0, return_polygons boolean DEFAULT true
- **Returns**: geometry

```sql
CREATE OR REPLACE FUNCTION public._st_voronoi(g1 geometry, clip geometry DEFAULT NULL::geometry, tolerance double precision DEFAULT 0.0, return_polygons boolean DEFAULT true)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 10000
AS '$libdir/postgis-3', $function$ST_Voronoi$function$

```


### pgis_geometry_accum_transfn

- **Type**: function
- **Language**: c
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: internal, geometry
- **Returns**: internal

```sql
CREATE OR REPLACE FUNCTION public.pgis_geometry_accum_transfn(internal, geometry)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_geometry_accum_transfn$function$

```


### pgis_geometry_accum_transfn

- **Type**: function
- **Language**: c
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: internal, geometry, double precision
- **Returns**: internal

```sql
CREATE OR REPLACE FUNCTION public.pgis_geometry_accum_transfn(internal, geometry, double precision)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_geometry_accum_transfn$function$

```


### pgis_geometry_accum_transfn

- **Type**: function
- **Language**: c
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: internal, geometry, double precision, integer
- **Returns**: internal

```sql
CREATE OR REPLACE FUNCTION public.pgis_geometry_accum_transfn(internal, geometry, double precision, integer)
 RETURNS internal
 LANGUAGE c
 PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_geometry_accum_transfn$function$

```


### pgis_geometry_collect_finalfn

- **Type**: function
- **Language**: c
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: internal
- **Returns**: geometry

```sql
CREATE OR REPLACE FUNCTION public.pgis_geometry_collect_finalfn(internal)
 RETURNS geometry
 LANGUAGE c
 PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_geometry_collect_finalfn$function$

```


### pgis_geometry_polygonize_finalfn

- **Type**: function
- **Language**: c
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: internal
- **Returns**: geometry

```sql
CREATE OR REPLACE FUNCTION public.pgis_geometry_polygonize_finalfn(internal)
 RETURNS geometry
 LANGUAGE c
 PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_geometry_polygonize_finalfn$function$

```


### pgis_geometry_clusterintersecting_finalfn

- **Type**: function
- **Language**: c
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: internal
- **Returns**: geometry[]

```sql
CREATE OR REPLACE FUNCTION public.pgis_geometry_clusterintersecting_finalfn(internal)
 RETURNS geometry[]
 LANGUAGE c
 PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_geometry_clusterintersecting_finalfn$function$

```


### pgis_geometry_clusterwithin_finalfn

- **Type**: function
- **Language**: c
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: internal
- **Returns**: geometry[]

```sql
CREATE OR REPLACE FUNCTION public.pgis_geometry_clusterwithin_finalfn(internal)
 RETURNS geometry[]
 LANGUAGE c
 PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_geometry_clusterwithin_finalfn$function$

```


### pgis_geometry_makeline_finalfn

- **Type**: function
- **Language**: c
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: internal
- **Returns**: geometry

```sql
CREATE OR REPLACE FUNCTION public.pgis_geometry_makeline_finalfn(internal)
 RETURNS geometry
 LANGUAGE c
 PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_geometry_makeline_finalfn$function$

```


### pgis_geometry_union_parallel_transfn

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: internal, geometry
- **Returns**: internal

```sql
CREATE OR REPLACE FUNCTION public.pgis_geometry_union_parallel_transfn(internal, geometry)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE
AS '$libdir/postgis-3', $function$pgis_geometry_union_parallel_transfn$function$

```


### pgis_geometry_union_parallel_transfn

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: internal, geometry, double precision
- **Returns**: internal

```sql
CREATE OR REPLACE FUNCTION public.pgis_geometry_union_parallel_transfn(internal, geometry, double precision)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_geometry_union_parallel_transfn$function$

```


### pgis_geometry_union_parallel_combinefn

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: internal, internal
- **Returns**: internal

```sql
CREATE OR REPLACE FUNCTION public.pgis_geometry_union_parallel_combinefn(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE
AS '$libdir/postgis-3', $function$pgis_geometry_union_parallel_combinefn$function$

```


### pgis_geometry_union_parallel_serialfn

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: internal
- **Returns**: bytea

```sql
CREATE OR REPLACE FUNCTION public.pgis_geometry_union_parallel_serialfn(internal)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$pgis_geometry_union_parallel_serialfn$function$

```


### pgis_geometry_union_parallel_deserialfn

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: bytea, internal
- **Returns**: internal

```sql
CREATE OR REPLACE FUNCTION public.pgis_geometry_union_parallel_deserialfn(bytea, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$pgis_geometry_union_parallel_deserialfn$function$

```


### pgis_geometry_union_parallel_finalfn

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: internal
- **Returns**: geometry

```sql
CREATE OR REPLACE FUNCTION public.pgis_geometry_union_parallel_finalfn(internal)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$pgis_geometry_union_parallel_finalfn$function$

```


### _st_linecrossingdirection

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: line1 geometry, line2 geometry
- **Returns**: integer

```sql
CREATE OR REPLACE FUNCTION public._st_linecrossingdirection(line1 geometry, line2 geometry)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_LineCrossingDirection$function$

```


### _st_dwithin

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geom1 geometry, geom2 geometry, double precision
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public._st_dwithin(geom1 geometry, geom2 geometry, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$LWGEOM_dwithin$function$

```


### _st_touches

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geom1 geometry, geom2 geometry
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public._st_touches(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$touches$function$

```


### _st_intersects

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geom1 geometry, geom2 geometry
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public._st_intersects(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_Intersects$function$

```


### _st_crosses

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geom1 geometry, geom2 geometry
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public._st_crosses(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$crosses$function$

```


### _st_contains

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geom1 geometry, geom2 geometry
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public._st_contains(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$contains$function$

```


### _st_containsproperly

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geom1 geometry, geom2 geometry
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public._st_containsproperly(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$containsproperly$function$

```


### _st_covers

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geom1 geometry, geom2 geometry
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public._st_covers(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$covers$function$

```


### _st_coveredby

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geom1 geometry, geom2 geometry
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public._st_coveredby(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$coveredby$function$

```


### _st_within

- **Type**: function
- **Language**: sql
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geom1 geometry, geom2 geometry
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public._st_within(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE
AS $function$SELECT public._ST_Contains($2,$1)$function$

```


### _st_overlaps

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geom1 geometry, geom2 geometry
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public._st_overlaps(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$overlaps$function$

```


### _st_dfullywithin

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geom1 geometry, geom2 geometry, double precision
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public._st_dfullywithin(geom1 geometry, geom2 geometry, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$LWGEOM_dfullywithin$function$

```


### _st_3ddwithin

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geom1 geometry, geom2 geometry, double precision
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public._st_3ddwithin(geom1 geometry, geom2 geometry, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$LWGEOM_dwithin3d$function$

```


### _st_3ddfullywithin

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geom1 geometry, geom2 geometry, double precision
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public._st_3ddfullywithin(geom1 geometry, geom2 geometry, double precision)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$LWGEOM_dfullywithin3d$function$

```


### _st_3dintersects

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geom1 geometry, geom2 geometry
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public._st_3dintersects(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_3DIntersects$function$

```


### _st_orderingequals

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geom1 geometry, geom2 geometry
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public._st_orderingequals(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$LWGEOM_same$function$

```


### _st_equals

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geom1 geometry, geom2 geometry
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public._st_equals(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$ST_Equals$function$

```


### postgis_index_supportfn

- **Type**: function
- **Language**: c
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: internal
- **Returns**: internal

```sql
CREATE OR REPLACE FUNCTION public.postgis_index_supportfn(internal)
 RETURNS internal
 LANGUAGE c
AS '$libdir/postgis-3', $function$postgis_index_supportfn$function$

```


### equals

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geom1 geometry, geom2 geometry
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public.equals(geom1 geometry, geom2 geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$ST_Equals$function$

```


### _st_geomfromgml

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: text, integer
- **Returns**: geometry

```sql
CREATE OR REPLACE FUNCTION public._st_geomfromgml(text, integer)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$geom_from_gml$function$

```


### postgis_libjson_version

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: 
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.postgis_libjson_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$postgis_libjson_version$function$

```


### _st_asgml

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: integer, geometry, integer, integer, text, text
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public._st_asgml(integer, geometry, integer, integer, text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$LWGEOM_asGML$function$

```


### json

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geometry
- **Returns**: json

```sql
CREATE OR REPLACE FUNCTION public.json(geometry)
 RETURNS json
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$geometry_to_json$function$

```


### jsonb

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geometry
- **Returns**: jsonb

```sql
CREATE OR REPLACE FUNCTION public.jsonb(geometry)
 RETURNS jsonb
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$geometry_to_jsonb$function$

```


### pgis_asmvt_transfn

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: internal, anyelement
- **Returns**: internal

```sql
CREATE OR REPLACE FUNCTION public.pgis_asmvt_transfn(internal, anyelement)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_asmvt_transfn$function$

```


### pgis_asmvt_transfn

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: internal, anyelement, text
- **Returns**: internal

```sql
CREATE OR REPLACE FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_asmvt_transfn$function$

```


### pgis_asmvt_transfn

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: internal, anyelement, text, integer
- **Returns**: internal

```sql
CREATE OR REPLACE FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text, integer)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_asmvt_transfn$function$

```


### pgis_asmvt_transfn

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: internal, anyelement, text, integer, text
- **Returns**: internal

```sql
CREATE OR REPLACE FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text, integer, text)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_asmvt_transfn$function$

```


### pgis_asmvt_transfn

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: internal, anyelement, text, integer, text, text
- **Returns**: internal

```sql
CREATE OR REPLACE FUNCTION public.pgis_asmvt_transfn(internal, anyelement, text, integer, text, text)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_asmvt_transfn$function$

```


### pgis_asmvt_finalfn

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: internal
- **Returns**: bytea

```sql
CREATE OR REPLACE FUNCTION public.pgis_asmvt_finalfn(internal)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_asmvt_finalfn$function$

```


### pgis_asmvt_combinefn

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: internal, internal
- **Returns**: internal

```sql
CREATE OR REPLACE FUNCTION public.pgis_asmvt_combinefn(internal, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_asmvt_combinefn$function$

```


### pgis_asmvt_serialfn

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: internal
- **Returns**: bytea

```sql
CREATE OR REPLACE FUNCTION public.pgis_asmvt_serialfn(internal)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_asmvt_serialfn$function$

```


### pgis_asmvt_deserialfn

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: bytea, internal
- **Returns**: internal

```sql
CREATE OR REPLACE FUNCTION public.pgis_asmvt_deserialfn(bytea, internal)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_asmvt_deserialfn$function$

```


### postgis_libprotobuf_version

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: 
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.postgis_libprotobuf_version()
 RETURNS text
 LANGUAGE c
 IMMUTABLE STRICT
AS '$libdir/postgis-3', $function$postgis_libprotobuf_version$function$

```


### pgis_asgeobuf_transfn

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: internal, anyelement
- **Returns**: internal

```sql
CREATE OR REPLACE FUNCTION public.pgis_asgeobuf_transfn(internal, anyelement)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_asgeobuf_transfn$function$

```


### pgis_asgeobuf_transfn

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: internal, anyelement, text
- **Returns**: internal

```sql
CREATE OR REPLACE FUNCTION public.pgis_asgeobuf_transfn(internal, anyelement, text)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_asgeobuf_transfn$function$

```


### pgis_asgeobuf_finalfn

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: internal
- **Returns**: bytea

```sql
CREATE OR REPLACE FUNCTION public.pgis_asgeobuf_finalfn(internal)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_asgeobuf_finalfn$function$

```


### pgis_asflatgeobuf_transfn

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: internal, anyelement
- **Returns**: internal

```sql
CREATE OR REPLACE FUNCTION public.pgis_asflatgeobuf_transfn(internal, anyelement)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_asflatgeobuf_transfn$function$

```


### pgis_asflatgeobuf_transfn

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: internal, anyelement, boolean
- **Returns**: internal

```sql
CREATE OR REPLACE FUNCTION public.pgis_asflatgeobuf_transfn(internal, anyelement, boolean)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_asflatgeobuf_transfn$function$

```


### pgis_asflatgeobuf_transfn

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: internal, anyelement, boolean, text
- **Returns**: internal

```sql
CREATE OR REPLACE FUNCTION public.pgis_asflatgeobuf_transfn(internal, anyelement, boolean, text)
 RETURNS internal
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 50
AS '$libdir/postgis-3', $function$pgis_asflatgeobuf_transfn$function$

```


### pgis_asflatgeobuf_finalfn

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: internal
- **Returns**: bytea

```sql
CREATE OR REPLACE FUNCTION public.pgis_asflatgeobuf_finalfn(internal)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$pgis_asflatgeobuf_finalfn$function$

```


### _st_sortablehash

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geom geometry
- **Returns**: bigint

```sql
CREATE OR REPLACE FUNCTION public._st_sortablehash(geom geometry)
 RETURNS bigint
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$_ST_SortableHash$function$

```


### _st_maxdistance

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geom1 geometry, geom2 geometry
- **Returns**: double precision

```sql
CREATE OR REPLACE FUNCTION public._st_maxdistance(geom1 geometry, geom2 geometry)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_maxdistance2d_linestring$function$

```


### _st_longestline

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geom1 geometry, geom2 geometry
- **Returns**: geometry

```sql
CREATE OR REPLACE FUNCTION public._st_longestline(geom1 geometry, geom2 geometry)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 500
AS '$libdir/postgis-3', $function$LWGEOM_longestline2d$function$

```


### unlockrows

args: auth_token - Removes all locks held by an authorization token.

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: text
- **Returns**: integer

```sql
CREATE OR REPLACE FUNCTION public.unlockrows(text)
 RETURNS integer
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	ret int;
BEGIN

	IF NOT LongTransactionsEnabled() THEN
		RAISE EXCEPTION 'Long transaction support disabled, use EnableLongTransaction() to enable.';
	END IF;

	EXECUTE 'DELETE FROM authorization_table where authid = ' ||
		quote_literal($1);

	GET DIAGNOSTICS ret = ROW_COUNT;

	RETURN ret;
END;
$function$

```


### lockrow

args: a_schema_name, a_table_name, a_row_key, an_auth_token, expire_dt - Sets lock/authorization for a row in a table.

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: text, text, text, text, timestamp without time zone
- **Returns**: integer

```sql
CREATE OR REPLACE FUNCTION public.lockrow(text, text, text, text, timestamp without time zone)
 RETURNS integer
 LANGUAGE plpgsql
 STRICT
AS $function$
DECLARE
	myschema alias for $1;
	mytable alias for $2;
	myrid   alias for $3;
	authid alias for $4;
	expires alias for $5;
	ret int;
	mytoid oid;
	myrec RECORD;

BEGIN

	IF NOT LongTransactionsEnabled() THEN
		RAISE EXCEPTION 'Long transaction support disabled, use EnableLongTransaction() to enable.';
	END IF;

	EXECUTE 'DELETE FROM authorization_table WHERE expires < now()';

	SELECT c.oid INTO mytoid FROM pg_class c, pg_namespace n
		WHERE c.relname = mytable
		AND c.relnamespace = n.oid
		AND n.nspname = myschema;

	-- RAISE NOTICE 'toid: %', mytoid;

	FOR myrec IN SELECT * FROM authorization_table WHERE
		toid = mytoid AND rid = myrid
	LOOP
		IF myrec.authid != authid THEN
			RETURN 0;
		ELSE
			RETURN 1;
		END IF;
	END LOOP;

	EXECUTE 'INSERT INTO authorization_table VALUES ('||
		quote_literal(mytoid::text)||','||quote_literal(myrid)||
		','||quote_literal(expires::text)||
		','||quote_literal(authid) ||')';

	GET DIAGNOSTICS ret = ROW_COUNT;

	RETURN ret;
END;
$function$

```


### lockrow

- **Type**: function
- **Language**: sql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: text, text, text, text
- **Returns**: integer

```sql
CREATE OR REPLACE FUNCTION public.lockrow(text, text, text, text)
 RETURNS integer
 LANGUAGE sql
 STRICT
AS $function$ SELECT LockRow($1, $2, $3, $4, now()::timestamp+'1:00'); $function$

```


### lockrow

args: a_table_name, a_row_key, an_auth_token - Sets lock/authorization for a row in a table.

- **Type**: function
- **Language**: sql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: text, text, text
- **Returns**: integer

```sql
CREATE OR REPLACE FUNCTION public.lockrow(text, text, text)
 RETURNS integer
 LANGUAGE sql
 STRICT
AS $function$ SELECT LockRow(current_schema(), $1, $2, $3, now()::timestamp+'1:00'); $function$

```


### lockrow

args: a_table_name, a_row_key, an_auth_token, expire_dt - Sets lock/authorization for a row in a table.

- **Type**: function
- **Language**: sql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: text, text, text, timestamp without time zone
- **Returns**: integer

```sql
CREATE OR REPLACE FUNCTION public.lockrow(text, text, text, timestamp without time zone)
 RETURNS integer
 LANGUAGE sql
 STRICT
AS $function$ SELECT LockRow(current_schema(), $1, $2, $3, $4); $function$

```


### addauth

args: auth_token - Adds an authorization token to be used in the current transaction.

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: text
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public.addauth(text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
	lockid alias for $1;
	okay boolean;
	myrec record;
BEGIN
	-- check to see if table exists
	--  if not, CREATE TEMP TABLE mylock (transid xid, lockcode text)
	okay := 'f';
	FOR myrec IN SELECT * FROM pg_class WHERE relname = 'temp_lock_have_table' LOOP
		okay := 't';
	END LOOP;
	IF (okay <> 't') THEN
		CREATE TEMP TABLE temp_lock_have_table (transid xid, lockcode text);
			-- this will only work from pgsql7.4 up
			-- ON COMMIT DELETE ROWS;
	END IF;

	--  INSERT INTO mylock VALUES ( $1)
--	EXECUTE 'INSERT INTO temp_lock_have_table VALUES ( '||
--		quote_literal(getTransactionID()) || ',' ||
--		quote_literal(lockid) ||')';

	INSERT INTO temp_lock_have_table VALUES (getTransactionID(), lockid);

	RETURN true::boolean;
END;
$function$

```


### checkauth

args: a_schema_name, a_table_name, a_key_column_name - Creates a trigger on a table to prevent/allow updates and deletes of rows based on authorization token.

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: text, text, text
- **Returns**: integer

```sql
CREATE OR REPLACE FUNCTION public.checkauth(text, text, text)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
	schema text;
BEGIN
	IF NOT LongTransactionsEnabled() THEN
		RAISE EXCEPTION 'Long transaction support disabled, use EnableLongTransaction() to enable.';
	END IF;

	if ( $1 != '' ) THEN
		schema = $1;
	ELSE
		SELECT current_schema() into schema;
	END IF;

	-- TODO: check for an already existing trigger ?

	EXECUTE 'CREATE TRIGGER check_auth BEFORE UPDATE OR DELETE ON '
		|| quote_ident(schema) || '.' || quote_ident($2)
		||' FOR EACH ROW EXECUTE PROCEDURE CheckAuthTrigger('
		|| quote_literal($3) || ')';

	RETURN 0;
END;
$function$

```


### checkauth

args: a_table_name, a_key_column_name - Creates a trigger on a table to prevent/allow updates and deletes of rows based on authorization token.

- **Type**: function
- **Language**: sql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: text, text
- **Returns**: integer

```sql
CREATE OR REPLACE FUNCTION public.checkauth(text, text)
 RETURNS integer
 LANGUAGE sql
AS $function$ SELECT CheckAuth('', $1, $2) $function$

```


### checkauthtrigger

- **Type**: function
- **Language**: c
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: 
- **Returns**: trigger

```sql
CREATE OR REPLACE FUNCTION public.checkauthtrigger()
 RETURNS trigger
 LANGUAGE c
AS '$libdir/postgis-3', $function$check_authorization$function$

```


### gettransactionid

- **Type**: function
- **Language**: c
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: 
- **Returns**: xid

```sql
CREATE OR REPLACE FUNCTION public.gettransactionid()
 RETURNS xid
 LANGUAGE c
AS '$libdir/postgis-3', $function$getTransactionID$function$

```


### postgis_typmod_srid

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: integer
- **Returns**: integer

```sql
CREATE OR REPLACE FUNCTION public.postgis_typmod_srid(integer)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$postgis_typmod_srid$function$

```


### postgis_typmod_type

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: integer
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.postgis_typmod_type(integer)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$postgis_typmod_type$function$

```


### enablelongtransactions

Enables long transaction support.

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: 
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.enablelongtransactions()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
	"query" text;
	exists bool;
	rec RECORD;

BEGIN

	exists = 'f';
	FOR rec IN SELECT * FROM pg_class WHERE relname = 'authorization_table'
	LOOP
		exists = 't';
	END LOOP;

	IF NOT exists
	THEN
		"query" = 'CREATE TABLE authorization_table (
			toid oid, -- table oid
			rid text, -- row id
			expires timestamp,
			authid text
		)';
		EXECUTE "query";
	END IF;

	exists = 'f';
	FOR rec IN SELECT * FROM pg_class WHERE relname = 'authorized_tables'
	LOOP
		exists = 't';
	END LOOP;

	IF NOT exists THEN
		"query" = 'CREATE VIEW authorized_tables AS ' ||
			'SELECT ' ||
			'n.nspname as schema, ' ||
			'c.relname as table, trim(' ||
			quote_literal(chr(92) || '000') ||
			' from t.tgargs) as id_column ' ||
			'FROM pg_trigger t, pg_class c, pg_proc p ' ||
			', pg_namespace n ' ||
			'WHERE p.proname = ' || quote_literal('checkauthtrigger') ||
			' AND c.relnamespace = n.oid' ||
			' AND t.tgfoid = p.oid and t.tgrelid = c.oid';
		EXECUTE "query";
	END IF;

	RETURN 'Long transactions support enabled';
END;
$function$

```


### longtransactionsenabled

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: 
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public.longtransactionsenabled()
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
	rec RECORD;
BEGIN
	FOR rec IN SELECT oid FROM pg_class WHERE relname = 'authorized_tables'
	LOOP
		return 't';
	END LOOP;
	return 'f';
END;
$function$

```


### disablelongtransactions

Disables long transaction support.

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: 
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public.disablelongtransactions()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
	rec RECORD;

BEGIN

	--
	-- Drop all triggers applied by CheckAuth()
	--
	FOR rec IN
		SELECT c.relname, t.tgname, t.tgargs FROM pg_trigger t, pg_class c, pg_proc p
		WHERE p.proname = 'checkauthtrigger' and t.tgfoid = p.oid and t.tgrelid = c.oid
	LOOP
		EXECUTE 'DROP TRIGGER ' || quote_ident(rec.tgname) ||
			' ON ' || quote_ident(rec.relname);
	END LOOP;

	--
	-- Drop the authorization_table table
	--
	FOR rec IN SELECT * FROM pg_class WHERE relname = 'authorization_table' LOOP
		DROP TABLE authorization_table;
	END LOOP;

	--
	-- Drop the authorized_tables view
	--
	FOR rec IN SELECT * FROM pg_class WHERE relname = 'authorized_tables' LOOP
		DROP VIEW authorized_tables;
	END LOOP;

	RETURN 'Long transactions support disabled';
END;
$function$

```


### geography

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geography, integer, boolean
- **Returns**: geography

```sql
CREATE OR REPLACE FUNCTION public.geography(geography, integer, boolean)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_enforce_typmod$function$

```


### geography

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: bytea
- **Returns**: geography

```sql
CREATE OR REPLACE FUNCTION public.geography(bytea)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_from_binary$function$

```


### bytea

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geography
- **Returns**: bytea

```sql
CREATE OR REPLACE FUNCTION public.bytea(geography)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$LWGEOM_to_bytea$function$

```


### postgis_typmod_dims

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: integer
- **Returns**: integer

```sql
CREATE OR REPLACE FUNCTION public.postgis_typmod_dims(integer)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$postgis_typmod_dims$function$

```


### geography

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geometry
- **Returns**: geography

```sql
CREATE OR REPLACE FUNCTION public.geography(geometry)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geography_from_geometry$function$

```


### geometry

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geography
- **Returns**: geometry

```sql
CREATE OR REPLACE FUNCTION public.geometry(geography)
 RETURNS geometry
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$geometry_from_geography$function$

```


### overlaps_geog

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: gidx, geography
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public.overlaps_geog(gidx, geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE STRICT
AS '$libdir/postgis-3', $function$gserialized_gidx_geog_overlaps$function$

```


### overlaps_geog

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: gidx, gidx
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public.overlaps_geog(gidx, gidx)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE STRICT
AS '$libdir/postgis-3', $function$gserialized_gidx_gidx_overlaps$function$

```


### overlaps_geog

- **Type**: function
- **Language**: sql
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geography, gidx
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public.overlaps_geog(geography, gidx)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE STRICT
AS $function$SELECT $2 OPERATOR(public.&&) $1;$function$

```


### geog_brin_inclusion_add_value

- **Type**: function
- **Language**: c
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: internal, internal, internal, internal
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public.geog_brin_inclusion_add_value(internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE c
AS '$libdir/postgis-3', $function$geog_brin_inclusion_add_value$function$

```


### _st_expand

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geography, double precision
- **Returns**: geography

```sql
CREATE OR REPLACE FUNCTION public._st_expand(geography, double precision)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$geography_expand$function$

```


### _st_distanceuncached

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geography, geography, double precision, boolean
- **Returns**: double precision

```sql
CREATE OR REPLACE FUNCTION public._st_distanceuncached(geography, geography, double precision, boolean)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE STRICT COST 10000
AS '$libdir/postgis-3', $function$geography_distance_uncached$function$

```


### _st_distanceuncached

- **Type**: function
- **Language**: sql
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geography, geography, boolean
- **Returns**: double precision

```sql
CREATE OR REPLACE FUNCTION public._st_distanceuncached(geography, geography, boolean)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE STRICT
AS $function$SELECT public._ST_DistanceUnCached($1, $2, 0.0, $3)$function$

```


### _st_distanceuncached

- **Type**: function
- **Language**: sql
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geography, geography
- **Returns**: double precision

```sql
CREATE OR REPLACE FUNCTION public._st_distanceuncached(geography, geography)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE STRICT
AS $function$SELECT public._ST_DistanceUnCached($1, $2, 0.0, true)$function$

```


### _st_distancetree

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geography, geography, double precision, boolean
- **Returns**: double precision

```sql
CREATE OR REPLACE FUNCTION public._st_distancetree(geography, geography, double precision, boolean)
 RETURNS double precision
 LANGUAGE c
 IMMUTABLE STRICT COST 10000
AS '$libdir/postgis-3', $function$geography_distance_tree$function$

```


### _st_distancetree

- **Type**: function
- **Language**: sql
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geography, geography
- **Returns**: double precision

```sql
CREATE OR REPLACE FUNCTION public._st_distancetree(geography, geography)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE STRICT
AS $function$SELECT public._ST_DistanceTree($1, $2, 0.0, true)$function$

```


### _st_dwithinuncached

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geography, geography, double precision, boolean
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public._st_dwithinuncached(geography, geography, double precision, boolean)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE STRICT COST 10000
AS '$libdir/postgis-3', $function$geography_dwithin_uncached$function$

```


### _st_dwithinuncached

- **Type**: function
- **Language**: sql
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geography, geography, double precision
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public._st_dwithinuncached(geography, geography, double precision)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
AS $function$SELECT $1 OPERATOR(public.&&) public._ST_Expand($2,$3) AND $2 OPERATOR(public.&&) public._ST_Expand($1,$3) AND public._ST_DWithinUnCached($1, $2, $3, true)$function$

```


### _st_pointoutside

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geography
- **Returns**: geography

```sql
CREATE OR REPLACE FUNCTION public._st_pointoutside(geography)
 RETURNS geography
 LANGUAGE c
 IMMUTABLE STRICT
AS '$libdir/postgis-3', $function$geography_point_outside$function$

```


### _st_bestsrid

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geography, geography
- **Returns**: integer

```sql
CREATE OR REPLACE FUNCTION public._st_bestsrid(geography, geography)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$geography_bestsrid$function$

```


### _st_bestsrid

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geography
- **Returns**: integer

```sql
CREATE OR REPLACE FUNCTION public._st_bestsrid(geography)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 50
AS '$libdir/postgis-3', $function$geography_bestsrid$function$

```


### _st_covers

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geog1 geography, geog2 geography
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public._st_covers(geog1 geography, geog2 geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$geography_covers$function$

```


### _st_dwithin

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geog1 geography, geog2 geography, tolerance double precision, use_spheroid boolean DEFAULT true
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public._st_dwithin(geog1 geography, geog2 geography, tolerance double precision, use_spheroid boolean DEFAULT true)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$geography_dwithin$function$

```


### _st_coveredby

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geog1 geography, geog2 geography
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public._st_coveredby(geog1 geography, geog2 geography)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS '$libdir/postgis-3', $function$geography_coveredby$function$

```


### postgis_type_name

- **Type**: function
- **Language**: sql
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geomname character varying, coord_dimension integer, use_new_name boolean DEFAULT true
- **Returns**: character varying

```sql
CREATE OR REPLACE FUNCTION public.postgis_type_name(geomname character varying, coord_dimension integer, use_new_name boolean DEFAULT true)
 RETURNS character varying
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 10000
AS $function$
	SELECT CASE WHEN $3 THEN new_name ELSE old_name END As geomname
	FROM
	( VALUES
			('GEOMETRY', 'Geometry', 2),
			('GEOMETRY', 'GeometryZ', 3),
			('GEOMETRYM', 'GeometryM', 3),
			('GEOMETRY', 'GeometryZM', 4),

			('GEOMETRYCOLLECTION', 'GeometryCollection', 2),
			('GEOMETRYCOLLECTION', 'GeometryCollectionZ', 3),
			('GEOMETRYCOLLECTIONM', 'GeometryCollectionM', 3),
			('GEOMETRYCOLLECTION', 'GeometryCollectionZM', 4),

			('POINT', 'Point', 2),
			('POINT', 'PointZ', 3),
			('POINTM','PointM', 3),
			('POINT', 'PointZM', 4),

			('MULTIPOINT','MultiPoint', 2),
			('MULTIPOINT','MultiPointZ', 3),
			('MULTIPOINTM','MultiPointM', 3),
			('MULTIPOINT','MultiPointZM', 4),

			('POLYGON', 'Polygon', 2),
			('POLYGON', 'PolygonZ', 3),
			('POLYGONM', 'PolygonM', 3),
			('POLYGON', 'PolygonZM', 4),

			('MULTIPOLYGON', 'MultiPolygon', 2),
			('MULTIPOLYGON', 'MultiPolygonZ', 3),
			('MULTIPOLYGONM', 'MultiPolygonM', 3),
			('MULTIPOLYGON', 'MultiPolygonZM', 4),

			('MULTILINESTRING', 'MultiLineString', 2),
			('MULTILINESTRING', 'MultiLineStringZ', 3),
			('MULTILINESTRINGM', 'MultiLineStringM', 3),
			('MULTILINESTRING', 'MultiLineStringZM', 4),

			('LINESTRING', 'LineString', 2),
			('LINESTRING', 'LineStringZ', 3),
			('LINESTRINGM', 'LineStringM', 3),
			('LINESTRING', 'LineStringZM', 4),

			('CIRCULARSTRING', 'CircularString', 2),
			('CIRCULARSTRING', 'CircularStringZ', 3),
			('CIRCULARSTRINGM', 'CircularStringM' ,3),
			('CIRCULARSTRING', 'CircularStringZM', 4),

			('COMPOUNDCURVE', 'CompoundCurve', 2),
			('COMPOUNDCURVE', 'CompoundCurveZ', 3),
			('COMPOUNDCURVEM', 'CompoundCurveM', 3),
			('COMPOUNDCURVE', 'CompoundCurveZM', 4),

			('CURVEPOLYGON', 'CurvePolygon', 2),
			('CURVEPOLYGON', 'CurvePolygonZ', 3),
			('CURVEPOLYGONM', 'CurvePolygonM', 3),
			('CURVEPOLYGON', 'CurvePolygonZM', 4),

			('MULTICURVE', 'MultiCurve', 2),
			('MULTICURVE', 'MultiCurveZ', 3),
			('MULTICURVEM', 'MultiCurveM', 3),
			('MULTICURVE', 'MultiCurveZM', 4),

			('MULTISURFACE', 'MultiSurface', 2),
			('MULTISURFACE', 'MultiSurfaceZ', 3),
			('MULTISURFACEM', 'MultiSurfaceM', 3),
			('MULTISURFACE', 'MultiSurfaceZM', 4),

			('POLYHEDRALSURFACE', 'PolyhedralSurface', 2),
			('POLYHEDRALSURFACE', 'PolyhedralSurfaceZ', 3),
			('POLYHEDRALSURFACEM', 'PolyhedralSurfaceM', 3),
			('POLYHEDRALSURFACE', 'PolyhedralSurfaceZM', 4),

			('TRIANGLE', 'Triangle', 2),
			('TRIANGLE', 'TriangleZ', 3),
			('TRIANGLEM', 'TriangleM', 3),
			('TRIANGLE', 'TriangleZM', 4),

			('TIN', 'Tin', 2),
			('TIN', 'TinZ', 3),
			('TINM', 'TinM', 3),
			('TIN', 'TinZM', 4) )
			 As g(old_name, new_name, coord_dimension)
	WHERE (upper(old_name) = upper($1) OR upper(new_name) = upper($1))
		AND coord_dimension = $2;
$function$

```


### postgis_constraint_srid

- **Type**: function
- **Language**: sql
- **Volatility**: stable
- **Security Definer**: No
- **Arguments**: geomschema text, geomtable text, geomcolumn text
- **Returns**: integer

```sql
CREATE OR REPLACE FUNCTION public.postgis_constraint_srid(geomschema text, geomtable text, geomcolumn text)
 RETURNS integer
 LANGUAGE sql
 STABLE PARALLEL SAFE STRICT COST 500
AS $function$
SELECT replace(replace(split_part(s.consrc, ' = ', 2), ')', ''), '(', '')::integer
		 FROM pg_class c, pg_namespace n, pg_attribute a
		 , (SELECT connamespace, conrelid, conkey, pg_get_constraintdef(oid) As consrc
			FROM pg_constraint) AS s
		 WHERE n.nspname = $1
		 AND c.relname = $2
		 AND a.attname = $3
		 AND a.attrelid = c.oid
		 AND s.connamespace = n.oid
		 AND s.conrelid = c.oid
		 AND a.attnum = ANY (s.conkey)
		 AND s.consrc LIKE '%srid(% = %';
$function$

```


### postgis_constraint_dims

- **Type**: function
- **Language**: sql
- **Volatility**: stable
- **Security Definer**: No
- **Arguments**: geomschema text, geomtable text, geomcolumn text
- **Returns**: integer

```sql
CREATE OR REPLACE FUNCTION public.postgis_constraint_dims(geomschema text, geomtable text, geomcolumn text)
 RETURNS integer
 LANGUAGE sql
 STABLE PARALLEL SAFE STRICT COST 500
AS $function$
SELECT  replace(split_part(s.consrc, ' = ', 2), ')', '')::integer
		 FROM pg_class c, pg_namespace n, pg_attribute a
		 , (SELECT connamespace, conrelid, conkey, pg_get_constraintdef(oid) As consrc
			FROM pg_constraint) AS s
		 WHERE n.nspname = $1
		 AND c.relname = $2
		 AND a.attname = $3
		 AND a.attrelid = c.oid
		 AND s.connamespace = n.oid
		 AND s.conrelid = c.oid
		 AND a.attnum = ANY (s.conkey)
		 AND s.consrc LIKE '%ndims(% = %';
$function$

```


### postgis_constraint_type

- **Type**: function
- **Language**: sql
- **Volatility**: stable
- **Security Definer**: No
- **Arguments**: geomschema text, geomtable text, geomcolumn text
- **Returns**: character varying

```sql
CREATE OR REPLACE FUNCTION public.postgis_constraint_type(geomschema text, geomtable text, geomcolumn text)
 RETURNS character varying
 LANGUAGE sql
 STABLE PARALLEL SAFE STRICT COST 500
AS $function$
SELECT  replace(split_part(s.consrc, '''', 2), ')', '')::varchar
		 FROM pg_class c, pg_namespace n, pg_attribute a
		 , (SELECT connamespace, conrelid, conkey, pg_get_constraintdef(oid) As consrc
			FROM pg_constraint) AS s
		 WHERE n.nspname = $1
		 AND c.relname = $2
		 AND a.attname = $3
		 AND a.attrelid = c.oid
		 AND s.connamespace = n.oid
		 AND s.conrelid = c.oid
		 AND a.attnum = ANY (s.conkey)
		 AND s.consrc LIKE '%geometrytype(% = %';
$function$

```


### contains_2d

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: box2df, geometry
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public.contains_2d(box2df, geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_contains_box2df_geom_2d$function$

```


### is_contained_2d

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: box2df, geometry
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public.is_contained_2d(box2df, geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_within_box2df_geom_2d$function$

```


### overlaps_2d

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: box2df, geometry
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public.overlaps_2d(box2df, geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_overlaps_box2df_geom_2d$function$

```


### overlaps_2d

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: box2df, box2df
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public.overlaps_2d(box2df, box2df)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_contains_box2df_box2df_2d$function$

```


### contains_2d

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: box2df, box2df
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public.contains_2d(box2df, box2df)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_contains_box2df_box2df_2d$function$

```


### is_contained_2d

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: box2df, box2df
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public.is_contained_2d(box2df, box2df)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_contains_box2df_box2df_2d$function$

```


### contains_2d

- **Type**: function
- **Language**: sql
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geometry, box2df
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public.contains_2d(geometry, box2df)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 1
AS $function$SELECT $2 OPERATOR(public.@) $1;$function$

```


### is_contained_2d

- **Type**: function
- **Language**: sql
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geometry, box2df
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public.is_contained_2d(geometry, box2df)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 1
AS $function$SELECT $2 OPERATOR(public.~) $1;$function$

```


### overlaps_2d

- **Type**: function
- **Language**: sql
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geometry, box2df
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public.overlaps_2d(geometry, box2df)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 1
AS $function$SELECT $2 OPERATOR(public.&&) $1;$function$

```


### overlaps_nd

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: gidx, geometry
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public.overlaps_nd(gidx, geometry)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_gidx_geom_overlaps$function$

```


### overlaps_nd

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: gidx, gidx
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public.overlaps_nd(gidx, gidx)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/postgis-3', $function$gserialized_gidx_gidx_overlaps$function$

```


### overlaps_nd

- **Type**: function
- **Language**: sql
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: geometry, gidx
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public.overlaps_nd(geometry, gidx)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT COST 1
AS $function$SELECT $2 OPERATOR(public.&&&) $1;$function$

```


### geom2d_brin_inclusion_add_value

- **Type**: function
- **Language**: c
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: internal, internal, internal, internal
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public.geom2d_brin_inclusion_add_value(internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$geom2d_brin_inclusion_add_value$function$

```


### geom3d_brin_inclusion_add_value

- **Type**: function
- **Language**: c
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: internal, internal, internal, internal
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public.geom3d_brin_inclusion_add_value(internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$geom3d_brin_inclusion_add_value$function$

```


### geom4d_brin_inclusion_add_value

- **Type**: function
- **Language**: c
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: internal, internal, internal, internal
- **Returns**: boolean

```sql
CREATE OR REPLACE FUNCTION public.geom4d_brin_inclusion_add_value(internal, internal, internal, internal)
 RETURNS boolean
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/postgis-3', $function$geom4d_brin_inclusion_add_value$function$

```


### _st_asx3d

- **Type**: function
- **Language**: c
- **Volatility**: immutable
- **Security Definer**: No
- **Arguments**: integer, geometry, integer, integer, text
- **Returns**: text

```sql
CREATE OR REPLACE FUNCTION public._st_asx3d(integer, geometry, integer, integer, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE COST 500
AS '$libdir/postgis-3', $function$LWGEOM_asX3D$function$

```


### update_updated_at

- **Type**: function
- **Language**: plpgsql
- **Volatility**: volatile
- **Security Definer**: No
- **Arguments**: 
- **Returns**: trigger

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$

```



## Triggers

### sites_updated_at

- **Table**: public.sites
- **Function**: update_updated_at
- **Events**: INSERT, DELETE


### refresh_clusters_trigger

- **Table**: public.sites
- **Function**: refresh_map_clusters
- **Events**: UPDATE, TRUNCATE

