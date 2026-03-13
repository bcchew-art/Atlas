#!/usr/bin/env node
/**
 * monday.js — Atlas's Monday.com GraphQL CLI tool
 *
 * Usage:
 *   node monday.js query '<gql>'               # run a GraphQL query
 *   node monday.js mutate '<gql>' '<vars_json>' # run a mutation with variables
 *   node monday.js get-board <boardId>          # get board info + items
 *   node monday.js get-item <itemId>            # get a single item's column values
 *   node monday.js create-item <boardId> '<name>' '<cols_json>'
 *   node monday.js update-item <boardId> <itemId> '<cols_json>'
 *   node monday.js add-update <itemId> '<body>' # post a comment/update
 *   node monday.js list-boards                  # list all boards in workspace
 *
 * Token: set MONDAY_API_TOKEN env var, or add to monday-config.json
 */

const fs   = require('fs');
const path = require('path');

// ── Token resolution ────────────────────────────────────────────────
const configPath = path.join(__dirname, 'monday-config.json');
let token = process.env.MONDAY_API_TOKEN;
if (!token && fs.existsSync(configPath)) {
  try {
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    token = cfg.token;
  } catch (e) { /* ignore */ }
}
if (!token) {
  console.error('[ERROR] No Monday.com API token found.');
  console.error('  Option A: set environment variable  MONDAY_API_TOKEN=<token>');
  console.error('  Option B: create scripts/monday-config.json with { "token": "<token>" }');
  console.error('  Get your token: monday.com → Profile → Developers → My API Tokens');
  process.exit(1);
}

// ── Core API call ───────────────────────────────────────────────────
async function gql(query, variables = {}) {
  const res = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
      'API-Version': '2024-01',
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors && json.errors.length) {
    throw new Error('Monday API error: ' + JSON.stringify(json.errors, null, 2));
  }
  return json.data;
}

// ── Commands ────────────────────────────────────────────────────────
const [,, cmd, ...args] = process.argv;

(async () => {
  switch (cmd) {

    case 'query': {
      const data = await gql(args[0]);
      console.log(JSON.stringify(data, null, 2));
      break;
    }

    case 'mutate': {
      const vars = args[1] ? JSON.parse(args[1]) : {};
      const data = await gql(args[0], vars);
      console.log(JSON.stringify(data, null, 2));
      break;
    }

    case 'list-boards': {
      const data = await gql(`{ boards(limit: 50) { id name description } }`);
      const boards = data.boards || [];
      boards.forEach(b => console.log(`[${b.id}] ${b.name}${b.description ? ' — ' + b.description : ''}`));
      break;
    }

    case 'get-board': {
      const boardId = args[0];
      if (!boardId) { console.error('Usage: monday.js get-board <boardId>'); process.exit(1); }
      const data = await gql(`
        query($id: ID!) {
          boards(ids: [$id]) {
            id name description
            columns { id title type }
            items_page(limit: 50) {
              items {
                id name
                column_values { id text value }
              }
            }
          }
        }
      `, { id: boardId });
      console.log(JSON.stringify(data.boards?.[0] || {}, null, 2));
      break;
    }

    case 'get-item': {
      const itemId = args[0];
      if (!itemId) { console.error('Usage: monday.js get-item <itemId>'); process.exit(1); }
      const data = await gql(`
        query($id: ID!) {
          items(ids: [$id]) {
            id name board { id name }
            column_values { id title text value }
          }
        }
      `, { id: itemId });
      console.log(JSON.stringify(data.items?.[0] || {}, null, 2));
      break;
    }

    case 'create-item': {
      const [boardId, itemName, colsJson] = args;
      if (!boardId || !itemName) { console.error('Usage: monday.js create-item <boardId> <name> [cols_json]'); process.exit(1); }
      const colVals = colsJson ? JSON.stringify(JSON.parse(colsJson)) : '{}';
      const data = await gql(`
        mutation($boardId: ID!, $itemName: String!, $colVals: JSON!) {
          create_item(board_id: $boardId, item_name: $itemName, column_values: $colVals) {
            id name
          }
        }
      `, { boardId, itemName, colVals });
      console.log(JSON.stringify(data.create_item, null, 2));
      break;
    }

    case 'update-item': {
      const [boardId, itemId, colsJson] = args;
      if (!boardId || !itemId || !colsJson) { console.error('Usage: monday.js update-item <boardId> <itemId> <cols_json>'); process.exit(1); }
      const colVals = JSON.stringify(JSON.parse(colsJson));
      const data = await gql(`
        mutation($boardId: ID!, $itemId: ID!, $colVals: JSON!) {
          change_multiple_column_values(board_id: $boardId, item_id: $itemId, column_values: $colVals) {
            id name
          }
        }
      `, { boardId, itemId: parseInt(itemId), colVals });
      console.log(JSON.stringify(data.change_multiple_column_values, null, 2));
      break;
    }

    case 'add-update': {
      const [itemId, body] = args;
      if (!itemId || !body) { console.error('Usage: monday.js add-update <itemId> <body>'); process.exit(1); }
      const data = await gql(`
        mutation($itemId: ID!, $body: String!) {
          create_update(item_id: $itemId, body: $body) { id }
        }
      `, { itemId: parseInt(itemId), body });
      console.log('Update created:', data.create_update?.id);
      break;
    }

    default:
      console.log(`Atlas Monday.com Tool — available commands:
  list-boards                            List all boards
  get-board <boardId>                    Get board columns + items
  get-item <itemId>                      Get item column values
  create-item <boardId> <name> [cols]    Create a new item
  update-item <boardId> <itemId> <cols>  Update column values
  add-update <itemId> <body>             Post a comment/update
  query <gql>                            Raw GraphQL query
  mutate <gql> [vars_json]               Raw GraphQL mutation
`);
  }
})().catch(e => {
  console.error('[ERROR]', e.message);
  process.exit(1);
});
