import { Client } from 'pg'

interface Config {
  key: string
  state: any
  // updated_at: string
  created_at: string
}

export function configModel(client: Client) {
  async function checkIfTableExists(): Promise<{ exists: boolean}> {
    const { rows } = await client.query<{exists: boolean}>(`
      SELECT EXISTS (
         SELECT FROM pg_tables
         WHERE  schemaname = 'system'
         AND    tablename  = 'migrations'
      );
   `)

    return rows[0]
  }

  async function get(config: string): Promise<Config | null> {
    const { rows } = await client.query(`
      SELECT * FROM system.migrations 
      WHERE key = $1
    `, [config])

    return rows[0]
  }

  async function createMigration({ key, state }: Pick<Config, 'key'| 'state' >): Promise<Config | null> {
    const { rows } = await client.query(`
      INSERT INTO system.migrations (key, state)
      VALUES                        ($1 ,  $2  )
    `, [key, JSON.stringify(state)])

    return rows[0]
  }

  async function setState({ key, state }: Pick<Config, 'key'| 'state' >): Promise<number> {
    const { rowCount } = await client.query(`
      UPDATE system.migrations 
      SET state = $2
      WHERE key = $1
    `, [key, JSON.stringify(state)])

    return rowCount
  }

  return {
    createMigration,
    get,
    checkIfTableExists,
    setState,
  }
}
