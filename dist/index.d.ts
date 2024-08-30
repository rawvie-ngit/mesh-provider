import { IFetcher, IListener, ISubmitter, IEvaluator, AccountInfo, UTxO, AssetMetadata, BlockInfo, Asset, Protocol, TransactionInfo, Action, Network } from '@meshsdk/common';

/**
 * The BeginProvider class provides methods to query Begin ID.
 *
 * To use this provider, simply create a new instance of the BeginProvider class and call the desired method.
 *
 * ```typescript
 * import { BeginProvider } from "@meshsdk/core";
 *
 * const beginProvider = new BeginProvider();
 * ```
 */
declare class BeginProvider {
    private readonly apikey;
    private readonly chainNumber;
    private readonly domainUrl;
    /**
     * Creates a new instance of the BeginProvider.
     * @param apikey The API key for querying Begin ID.
     */
    constructor(apikey?: string);
    /**
     * Given a Begin ID, resolves the address and other information.
     * @param name name of Begin ID, e.g. `mesh`
     * @param url optional URL to override the default: https://resolveidaddress-ylo5dtxzdq-uc.a.run.app
     * @returns
     * - name: string
     * - domain: string
     * - image: string
     * - address: string
     */
    resolveAddress(name: string, url?: string): Promise<{
        name: string;
        domain: string;
        image: string;
        address: string;
    }>;
    /**
     * Given an address, resolves the Begin ID and other information.
     * @param address address to resolve
     * @param url optional URL to override the default: https://resolveIdReserveAddress-ylo5dtxzdq-uc.a.run.app
     * @returns
     * - name: string
     * - domain: string
     * - image: string
     * - address: string
     */
    resolveAdressReverse(address: string, url?: string): Promise<{
        name: string;
        domain: string;
        image: string;
        address: string;
    }>;
}

type BlockfrostSupportedNetworks = "mainnet" | "preview" | "preprod";
declare class BlockfrostProvider implements IFetcher, IListener, ISubmitter, IEvaluator {
    private readonly _axiosInstance;
    private readonly _network;
    /**
     * If you are using a privately hosted Blockfrost instance, you can set the URL in the parameter.
     * @param baseUrl The base URL of the instance.
     */
    constructor(baseUrl: string);
    /**
     * If you are using [Blockfrost](https://blockfrost.io/) hosted instance, you can set the project ID in the parameter.
     * @param projectId The project ID of the instance.
     * @param version The version of the API. Default is 0.
     */
    constructor(projectId: string, version?: number);
    evaluateTx(cbor: string): Promise<any>;
    fetchAccountInfo(address: string): Promise<AccountInfo>;
    fetchAddressUTxOs(address: string, asset?: string): Promise<UTxO[]>;
    fetchAssetAddresses(asset: string): Promise<{
        address: string;
        quantity: string;
    }[]>;
    fetchAssetMetadata(asset: string): Promise<AssetMetadata>;
    fetchLatestBlock(): Promise<BlockInfo>;
    fetchBlockInfo(hash: string): Promise<BlockInfo>;
    fetchCollectionAssets(policyId: string, cursor?: number): Promise<{
        assets: Asset[];
        next: string | number | null;
    }>;
    fetchHandle(handle: string): Promise<AssetMetadata>;
    fetchHandleAddress(handle: string): Promise<string>;
    fetchProtocolParameters(epoch?: number): Promise<Protocol>;
    fetchTxInfo(hash: string): Promise<TransactionInfo>;
    fetchUTxOs(hash: string): Promise<UTxO[]>;
    onTxConfirmed(txHash: string, callback: () => void, limit?: number): void;
    submitTx(tx: string): Promise<string>;
    private resolveScriptRef;
    private toUTxO;
    private fetchPlutusScriptCBOR;
    private fetchNativeScriptJSON;
}

type KoiosSupportedNetworks = "api" | "preview" | "preprod" | "guild";
declare class KoiosProvider implements IFetcher, IListener, ISubmitter {
    private readonly _axiosInstance;
    private readonly _network;
    constructor(baseUrl: string);
    constructor(network: KoiosSupportedNetworks, token: string, version?: number);
    fetchAccountInfo(address: string): Promise<AccountInfo>;
    fetchAddressUTxOs(address: string, asset?: string): Promise<UTxO[]>;
    fetchAssetAddresses(asset: string): Promise<{
        address: string;
        quantity: string;
    }[]>;
    fetchAssetMetadata(asset: string): Promise<AssetMetadata>;
    fetchBlockInfo(hash: string): Promise<BlockInfo>;
    fetchCollectionAssets(policyId: string): Promise<{
        assets: Asset[];
    }>;
    fetchHandle(handle: string): Promise<AssetMetadata>;
    fetchHandleAddress(handle: string): Promise<string>;
    fetchProtocolParameters(epoch?: number): Promise<Protocol>;
    fetchTxInfo(hash: string): Promise<TransactionInfo>;
    fetchUTxOs(hash: string): Promise<UTxO[]>;
    onTxConfirmed(txHash: string, callback: () => void, limit?: number): void;
    submitTx(tx: string): Promise<string>;
    private toUTxO;
    private resolveScriptRef;
}

type MaestroSupportedNetworks = "Mainnet" | "Preprod" | "Preview";
interface MaestroConfig {
    network: MaestroSupportedNetworks;
    apiKey: string;
    turboSubmit?: boolean;
}
declare class MaestroProvider implements IFetcher, ISubmitter, IEvaluator, IListener {
    private readonly _axiosInstance;
    private readonly _amountsAsStrings;
    private readonly _network;
    submitUrl: string;
    constructor({ network, apiKey, turboSubmit }: MaestroConfig);
    evaluateTx(cbor: string): Promise<Omit<Action, "data">[]>;
    fetchAccountInfo(address: string): Promise<AccountInfo>;
    fetchAddressUTxOs(address: string, asset?: string): Promise<UTxO[]>;
    fetchAssetAddresses(asset: string): Promise<{
        address: string;
        quantity: string;
    }[]>;
    fetchAssetMetadata(asset: string): Promise<AssetMetadata>;
    fetchBlockInfo(hash: string): Promise<BlockInfo>;
    fetchCollectionAssets(policyId: string, cursor?: string): Promise<{
        assets: Asset[];
        next: string | number | null;
    }>;
    fetchHandle(handle: string): Promise<object>;
    fetchHandleAddress(handle: string): Promise<string>;
    fetchProtocolParameters(epoch?: number): Promise<Protocol>;
    fetchTxInfo(hash: string): Promise<TransactionInfo>;
    fetchUTxOs(hash: string): Promise<UTxO[]>;
    onTxConfirmed(txHash: string, callback: () => void, limit?: number): void;
    submitTx(tx: string): Promise<string>;
    private toUTxO;
    private resolveScript;
}

declare class OgmiosProvider implements IEvaluator, ISubmitter {
    private readonly _baseUrl;
    constructor(baseUrl: string);
    constructor(network: Network);
    evaluateTx(tx: string): Promise<Omit<Action, "data">[]>;
    onNextTx(callback: (tx: unknown) => void): Promise<() => void>;
    submitTx(tx: string): Promise<string>;
    private open;
    private send;
}

declare class YaciProvider implements IFetcher, IListener, ISubmitter, IEvaluator {
    private readonly _axiosInstance;
    /**
     * Set the URL of the instance.
     * @param baseUrl The base URL of the instance.
     */
    constructor(baseUrl?: string);
    fetchAccountInfo(address: string): Promise<AccountInfo>;
    private resolveScriptRef;
    private toUTxO;
    fetchAddressUTxOs(address: string, asset?: string): Promise<UTxO[]>;
    fetchAssetAddresses(asset: string): Promise<{
        address: string;
        quantity: string;
    }[]>;
    fetchAssetMetadata(asset: string): Promise<AssetMetadata>;
    fetchBlockInfo(hash: string): Promise<BlockInfo>;
    fetchCollectionAssets(policyId: string, cursor?: number): Promise<{
        assets: Asset[];
        next: string | number | null;
    }>;
    fetchHandle(handle: string): Promise<object>;
    fetchHandleAddress(handle: string): Promise<string>;
    fetchProtocolParameters(epoch?: number): Promise<Protocol>;
    fetchTxInfo(hash: string): Promise<TransactionInfo>;
    fetchUTxOs(hash: string): Promise<UTxO[]>;
    onTxConfirmed(txHash: string, callback: () => void, limit?: number): void;
    submitTx(txHex: string): Promise<string>;
    evaluateTx(txHex: string): Promise<Omit<Action, "data">[]>;
    private fetchPlutusScriptCBOR;
    private fetchNativeScriptJSON;
}

export { BeginProvider, BlockfrostProvider, type BlockfrostSupportedNetworks, KoiosProvider, type KoiosSupportedNetworks, MaestroProvider, type MaestroSupportedNetworks, OgmiosProvider, YaciProvider };
