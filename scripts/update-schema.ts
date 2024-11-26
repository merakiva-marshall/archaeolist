// src/utils/supabase/inspector.ts

import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local file
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const DOCS_OUTPUT_PATH = path.join(process.cwd(), 'docs/schema');
const TYPES_OUTPUT_PATH = path.join(process.cwd(), 'src/lib/supabase/types.ts');

// Make sure to use service role key for full schema access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SchemaInspectorOptions {
  outputPath?: string;
  pretty?: boolean;
}

interface Policy {
  name: string;
  definition: string;
  command: string;
  permissive: boolean;
  roles: string[];
}

interface Column {
  name: string;
  type: string;
  is_nullable: boolean;
  description: string | null;
  default_value: string | null;
  is_identity: boolean;
  is_updatable: boolean;
}

interface Table {
  table_schema: string;
  table_name: string;
  description: string | null;
  columns: Column[];
  policies: Policy[] | null;
}

interface Function {
  name: string;
  arguments: string;
  result_type: string;
  description: string | null;
  language: string;
  type: 'function' | 'procedure' | 'aggregate' | 'window';
  volatility: 'immutable' | 'stable' | 'volatile';
  security_definer: boolean;
  source: string;
  schema: string;
}

interface Enum {
  name: string;
  values: string[];
}

interface Trigger {
  name: string;
  table: string;
  function: string;
  description: string | null;
  events: string[];
}

interface SchemaInfo {
  tables: Table[];
  functions: Function[];
  enums: Enum[];
  triggers: Trigger[];
}

interface GeneratedTypes {
  core: string;
  system: string;
}

interface Documentation {
  core: string;
  full: string;
}

export async function inspectSchema(options: SchemaInspectorOptions = {}) {
  const outputPath = options.outputPath || DOCS_OUTPUT_PATH;
  const pretty = options.pretty ?? true;

  try {
    // Query schema info using our enhanced function
    const { data: schemaInfo, error } = await supabase
      .rpc('get_schema_info', {
        schema_name: 'public'
      });

    if (error) {
      const err = new Error(`Failed to fetch schema info: ${error.message}`);
      console.error(err);
      throw err;
    }

    if (!schemaInfo) {
      const err = new Error('No schema info returned from database');
      console.error(err);
      throw err;
    }

    // Ensure output directory exists
    await fs.mkdir(outputPath, { recursive: true });

    // Write schema documentation
    await writeSchemaDocumentation(schemaInfo, outputPath);

    console.log('Schema documentation updated successfully', {
      outputPath,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Schema inspection failed:', error);
    throw error;
  }
}

function isSystemTable(table: Table): boolean {
  // Skip PostGIS and system tables
  return (
    table.table_name.startsWith('geometry_') ||
    table.table_name.startsWith('geography_') ||
    table.table_name.startsWith('spatial_') ||
    table.table_name === 'query_stats'
  );
}

function generateTypeDefinitions(schema: SchemaInfo): GeneratedTypes {
  const coreTypes: string[] = [];
  const systemTypes: string[] = [];

  // Generate enum types
  schema.enums.forEach(enum_ => {
    let enumType = `export enum ${enum_.name} {\n`;
    enum_.values.forEach(value => {
      enumType += `  ${value} = "${value}",\n`;
    });
    enumType += `}\n\n`;
    coreTypes.push(enumType);
  });

  // Generate table types (split between core and system)
  schema.tables.forEach(table => {
    let tableType = `export interface ${pascalCase(table.table_name)} {\n`;
    table.columns.forEach(column => {
      const tsType = sqlTypeToTypeScript(column.type || 'unknown');
      const nullable = column.is_nullable ? '| null' : '';
      tableType += `  /** ${column.description || ''} */\n`;
      tableType += `  ${column.name}: ${tsType}${nullable};\n`;
    });
    tableType += `}\n\n`;
    
    if (isSystemTable(table)) {
      systemTypes.push(tableType);
    } else {
      coreTypes.push(tableType);
    }
  });

  // Split function types between core and system
  schema.functions.forEach(func => {
    let funcType = `export type ${pascalCase(func.name)} = (\n`;
    const args = (func.arguments || '').split(',').map(arg => {
      const [name = '', type = 'unknown'] = arg.trim().split(' ');
      return `${name}: ${sqlTypeToTypeScript(type)}`;
    }).join(', ');
    funcType += `  ${args}\n`;
    funcType += `) => Promise<${sqlTypeToTypeScript(func.result_type || 'unknown')}>;\n\n`;
    
    // Core functions are ones we've created
    if (func.schema === 'public' && !func.name.startsWith('st_') && !func.name.startsWith('postgis_')) {
      coreTypes.push(funcType);
    } else {
      systemTypes.push(funcType);
    }
  });

  return {
    core: coreTypes.join('\n\n'),
    system: systemTypes.join('\n\n')
  };
}

function generateDocumentation(schema: SchemaInfo): Documentation {
  const coreDoc: string[] = ['# Database Schema Documentation\n\nThis document contains the application-specific database schema. For system tables and PostGIS functions, see FULL_SCHEMA.md.\n'];
  const fullDoc: string[] = ['# Complete Database Schema Documentation\n\nThis document contains all database objects, including system tables and PostGIS functions. For application-specific schema, see README.md.\n'];

  // Document tables
  if (schema.tables.length > 0) {
    const coreTables = schema.tables.filter(t => !isSystemTable(t));
    
    if (coreTables.length > 0) {
      coreDoc.push('## Tables\n');
    }
    fullDoc.push('## Tables\n');
  
    schema.tables.forEach(table => {
      let tableDoc = `### ${table.table_name}\n\n`;

      if (table.description) {
        tableDoc += `${table.description}\n\n`;
      }

      tableDoc += '#### Columns\n\n';
      tableDoc += '| Column | Type | Nullable | Default | Identity | Description |\n';
      tableDoc += '|--------|------|----------|----------|----------|-------------|\n';

      table.columns.forEach(col => {
        tableDoc += `| ${col.name} | ${col.type || 'unknown'} | ${col.is_nullable ? 'Yes' : 'No'} | ${col.default_value || '-'} | ${col.is_identity ? 'Yes' : 'No'} | ${col.description || '-'} |\n`;
      });
      tableDoc += '\n';

      if (table.policies && table.policies.length > 0) {
        tableDoc += '#### Row Level Security Policies\n\n';
        tableDoc += '| Policy | Command | Type | Definition |\n';
        tableDoc += '|---------|---------|------|------------|\n';
        table.policies.forEach(policy => {
          tableDoc += `| ${policy.name} | ${policy.command} | ${policy.permissive ? 'PERMISSIVE' : 'RESTRICTIVE'} | ${policy.definition} |\n`;
        });
        tableDoc += '\n';
      }
      
      if (!isSystemTable(table)) {
        coreDoc.push(tableDoc);
      }
      fullDoc.push(tableDoc);
    });
  }

  // Document functions
  if (schema.functions.length > 0) {
    coreDoc.push('\n## Custom Functions\n');
    fullDoc.push('\n## All Functions\n');

    schema.functions.forEach(func => {
      let funcDoc = `### ${func.name}\n\n`;

      if (func.description) {
        funcDoc += `${func.description}\n\n`;
      }
      funcDoc += `- **Type**: ${func.type}\n`;
      funcDoc += `- **Language**: ${func.language}\n`;
      funcDoc += `- **Volatility**: ${func.volatility}\n`;
      funcDoc += `- **Security Definer**: ${func.security_definer ? 'Yes' : 'No'}\n`;
      funcDoc += `- **Arguments**: ${func.arguments}\n`;
      funcDoc += `- **Returns**: ${func.result_type}\n\n`;
      funcDoc += '```sql\n';
      funcDoc += func.source;
      funcDoc += '\n```\n\n';
      
      // Only include custom functions in core doc
      if (func.schema === 'public' && !func.name.startsWith('st_') && !func.name.startsWith('postgis_')) {
        coreDoc.push(funcDoc);
      }
      fullDoc.push(funcDoc);
    });
  }

  // Document enums
  if (schema.enums.length > 0) {
    coreDoc.push('\n## Enums\n');
    fullDoc.push('\n## Enums\n');
  
    schema.enums.forEach(enum_ => {
      let enumDoc = `### ${enum_.name}\n\n`;
      enumDoc += 'Values:\n';
      enum_.values.forEach(value => {
        enumDoc += `- ${value}\n`;
      });
      enumDoc += '\n';
      coreDoc.push(enumDoc);
      fullDoc.push(enumDoc);
    });
  }

  // Document triggers
  if (schema.triggers.length > 0) {
    coreDoc.push('\n## Triggers\n');
    fullDoc.push('\n## Triggers\n');
  
    schema.triggers.forEach(trigger => {
      let triggerDoc = `### ${trigger.name}\n\n`;
      if (trigger.description) {
        triggerDoc += `${trigger.description}\n\n`;
      }
      triggerDoc += `- **Table**: ${trigger.table}\n`;
      triggerDoc += `- **Function**: ${trigger.function}\n`;
      triggerDoc += `- **Events**: ${trigger.events.join(', ')}\n\n`;
      coreDoc.push(triggerDoc);
      fullDoc.push(triggerDoc);
    });
  }

  return {
    core: coreDoc.join('\n'),
    full: fullDoc.join('\n')
  };
}

async function writeSchemaDocumentation(schemaInfo: SchemaInfo, outputPath: string) {
  const types = generateTypeDefinitions(schemaInfo);
  const docs = generateDocumentation(schemaInfo);

  // Write documentation files
  await fs.writeFile(
    path.join(outputPath, 'types.ts'),
    types.core
  );

  await fs.writeFile(
    path.join(outputPath, 'system-types.ts'),
    types.system
  );

  await fs.writeFile(
    path.join(outputPath, 'README.md'),
    docs.core
  );

  await fs.writeFile(
    path.join(outputPath, 'FULL_SCHEMA.md'),
    docs.full
  );

  // Write clean types to src directory
  const cleanTypes = generateCleanTypes(schemaInfo);
  await fs.writeFile(TYPES_OUTPUT_PATH, cleanTypes);
}

function generateCleanTypes(schema: SchemaInfo): string {
  const lines: string[] = [
    '// Clean TypeScript types for Supabase functions and tables',
    '// Auto-generated by scripts/update-schema.ts',
    '// For full schema documentation, see docs/schema/',
    '',
    'export interface QueryStats {',
    '  calls: number | null;',
    '  mean_exec_time: number | null;',
    '  query: string | null;',
    '  rows: number | null;',
    '  total_exec_seconds: number | null;',
    '}',
    ''
  ];

  // Add table types
  schema.tables
    .filter(t => !isSystemTable(t))
    .forEach(table => {
      lines.push(`export interface ${pascalCase(table.table_name)} {`);
      table.columns.forEach(col => {
        const tsType = sqlTypeToTypeScript(col.type);
        lines.push(`  ${col.name}${col.is_nullable ? '?' : ''}: ${tsType};`);
      });
      lines.push('}');
      lines.push('');
    });

  // Add function types
  schema.functions
    .filter(f => !f.name.startsWith('_'))
    .forEach(func => {
      const returnType = sqlTypeToTypeScript(func.result_type);
      lines.push(`export type ${pascalCase(func.name)} = (`);
      if (func.arguments) {
        const args = func.arguments.split(',').map(arg => {
          const [name, type] = arg.trim().split(' ');
          return `  ${name}: ${sqlTypeToTypeScript(type)}`;
        });
        lines.push(args.join(',\\n'));
      }
      lines.push(`) => Promise<${returnType}>;`);
      lines.push('');
    });

  return lines.join('\\n');
}

// Helper function to convert SQL types to TypeScript types
function sqlTypeToTypeScript(sqlType: string): string {
  if (!sqlType) return 'any';
  
  const type = sqlType.toLowerCase();
  const typeMap: Record<string, string> = {
    'integer': 'number',
    'bigint': 'number',
    'smallint': 'number',
    'decimal': 'number',
    'numeric': 'number',
    'real': 'number',
    'double precision': 'number',
    'boolean': 'boolean',
    'character varying': 'string',
    'varchar': 'string',
    'character': 'string',
    'char': 'string',
    'text': 'string',
    'json': 'any',
    'jsonb': 'any',
    'timestamp': 'string',
    'timestamp with time zone': 'string',
    'timestamp without time zone': 'string',
    'date': 'string',
    'time': 'string',
    'interval': 'string',
    'uuid': 'string',
    'bytea': 'Uint8Array',
    'point': 'any',
    'line': 'any',
    'lseg': 'any',
    'box': 'any',
    'path': 'any',
    'polygon': 'any',
    'circle': 'any',
    'cidr': 'string',
    'inet': 'string',
    'macaddr': 'string',
    'bit': 'string',
    'bit varying': 'string',
    'money': 'string',
    'xml': 'string',
    'void': 'void'
  };

  // Handle arrays
  if (type.endsWith('[]')) {
    const baseType = type.slice(0, -2);
    return `${sqlTypeToTypeScript(baseType)}[]`;
  }

  // Handle custom types (enums, etc)
  if (!typeMap[type]) {
    if (type.includes('enum')) return 'string';
    console.warn(`Unknown SQL type: ${type}, defaulting to 'any'`);
    return 'any';
  }

  return typeMap[type];
}

// Helper function to convert snake_case to PascalCase
function pascalCase(str: string): string {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

// CLI support
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  inspectSchema()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Schema inspection failed:', error);
      process.exit(1);
    });
}