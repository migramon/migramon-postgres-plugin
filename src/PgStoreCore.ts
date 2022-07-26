import MigraMonStore from '@migramon/migrate/classes/Store'
import { configModel } from './models/configModel'
import { Client } from 'pg'

class PgStoreCore implements MigraMonStore {
  protected client: Client

  models: {
    configModel: ReturnType<typeof configModel>
  }

  constructor(params: {
    client:Client
  }) {
    const { client } = params
    this.client = client
    this.models = {
      configModel: configModel(client),
    }
  }

  init() {
    // mock
  }

  async getMigration(key: string): Promise<any> {
    const config = await this.models.configModel.get(key)
    return config?.state
  }

  async createMigration({ key, state }: { key: string; state:any }): Promise<any> {
    const config = await this.models.configModel.createMigration({ key, state })
    return config?.state
  }

  async setMigration({ key, state }: { key: string; state: any }): Promise<any> {
    const changed = await this.models.configModel.setState({ key, state })
    return changed
  }
}

export default PgStoreCore
