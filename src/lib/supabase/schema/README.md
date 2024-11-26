# Database Schema Documentation

This document contains the application-specific database schema. For system tables and PostGIS functions, see FULL_SCHEMA.md.

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



## Custom Functions


## Triggers

### sites_updated_at

- **Table**: public.sites
- **Function**: update_updated_at
- **Events**: INSERT, DELETE


### refresh_clusters_trigger

- **Table**: public.sites
- **Function**: refresh_map_clusters
- **Events**: UPDATE, TRUNCATE

