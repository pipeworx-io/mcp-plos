# @pipeworx/plos

[PLOS](https://www.plos.org) Search API MCP — full-text search across all PLOS open-access journals. Keyless (PLOS's Solr-backed API).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `search(query, rows?, start?, sort?, fl?)` — Solr-style search
- `article(doi)` — article by DOI
- `search_authored_by(name, rows?)` — articles by author name
- `recent(rows?)` — most recent publications across PLOS

## Data source

`https://api.plos.org/search` (use the `q` Solr query syntax).

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "plos": {
      "url": "https://gateway.pipeworx.io/plos/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Plos data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
