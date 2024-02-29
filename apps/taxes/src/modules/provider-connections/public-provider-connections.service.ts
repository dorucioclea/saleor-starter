import { Client } from "urql";
import { PublicAvataxConnectionService } from "../avatax/configuration/public-avatax-connection.service";
import { PublicTaxJarConnectionService } from "../taxjar/configuration/public-taxjar-connection.service";
import { createLogger } from "../../logger";

export const TAX_PROVIDER_KEY = "tax-providers-v2";

export class PublicProviderConnectionsService {
  private avataxConnectionService: PublicAvataxConnectionService;
  private taxJarConnectionService: PublicTaxJarConnectionService;
  private logger = createLogger("PublicProviderConnectionsService", {
    metadataKey: TAX_PROVIDER_KEY,
  });
  constructor({
    client,
    appId,
    saleorApiUrl,
  }: {
    client: Client;
    appId: string;
    saleorApiUrl: string;
  }) {
    this.avataxConnectionService = new PublicAvataxConnectionService({
      client,
      appId,
      saleorApiUrl,
    });
    this.taxJarConnectionService = new PublicTaxJarConnectionService({
      client,
      appId,
      saleorApiUrl,
    });
  }

  async getAll() {
    const taxJar = await this.taxJarConnectionService.getAll();
    const avatax = await this.avataxConnectionService.getAll();

    return [...taxJar, ...avatax];
  }
}
