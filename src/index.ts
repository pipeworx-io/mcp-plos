interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * PLOS Search MCP — Solr-backed search over all PLOS journals.
 *
 * Auth: none. Docs: https://api.plos.org/solr/search-fields/
 */


const BASE = 'https://api.plos.org/search';
const UA = 'pipeworx-mcp-plos/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search',
    description: 'Solr search across all PLOS journals.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'e.g. "abstract:CRISPR AND title:gene"' },
        rows: { type: 'number', description: '1-1000 (default 25)' },
        start: { type: 'number' },
        sort: { type: 'string', description: 'e.g. "publication_date desc"' },
        fl: { type: 'string', description: 'Comma-sep fields to return.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'article',
    description: 'Article by DOI.',
    inputSchema: {
      type: 'object',
      properties: { doi: { type: 'string', description: 'e.g. "10.1371/journal.pone.0153207"' } },
      required: ['doi'],
    },
  },
  {
    name: 'search_authored_by',
    description: 'Articles by author name.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        rows: { type: 'number' },
      },
      required: ['name'],
    },
  },
  {
    name: 'recent',
    description: 'Most recent publications across PLOS.',
    inputSchema: {
      type: 'object',
      properties: { rows: { type: 'number' } },
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search':
      return plosGet({
        q: reqStr(args, 'query', '"abstract:CRISPR"'),
        rows: String(Math.min(1000, Math.max(1, (args.rows as number) ?? 25))),
        start: String(Math.max(0, (args.start as number) ?? 0)),
        sort: (args.sort as string | undefined) ?? '',
        fl: (args.fl as string | undefined) ?? 'id,journal,publication_date,title,author_display,abstract',
      });
    case 'article':
      return plosGet({
        q: `id:"${reqStr(args, 'doi', '"10.1371/journal.pone.0153207"')}"`,
        rows: '1',
      });
    case 'search_authored_by':
      return plosGet({
        q: `author:"${reqStr(args, 'name', '"Jennifer Doudna"')}"`,
        rows: String(Math.min(1000, Math.max(1, (args.rows as number) ?? 25))),
        fl: 'id,journal,publication_date,title,author_display',
      });
    case 'recent':
      return plosGet({
        q: '*:*',
        sort: 'publication_date desc',
        rows: String(Math.min(1000, Math.max(1, (args.rows as number) ?? 25))),
        fl: 'id,journal,publication_date,title,author_display',
      });
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function plosGet(opts: Record<string, string>): Promise<unknown> {
  const params = new URLSearchParams({ wt: 'json' });
  for (const [k, v] of Object.entries(opts)) if (v) params.set(k, v);
  const res = await fetch(`${BASE}?${params}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`PLOS: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
