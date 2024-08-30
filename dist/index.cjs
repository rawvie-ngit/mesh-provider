"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  BeginProvider: () => BeginProvider,
  BlockfrostProvider: () => BlockfrostProvider,
  KoiosProvider: () => KoiosProvider,
  MaestroProvider: () => MaestroProvider,
  OgmiosProvider: () => OgmiosProvider,
  YaciProvider: () => YaciProvider
});
module.exports = __toCommonJS(src_exports);

// src/begin.ts
var import_axios2 = __toESM(require("axios"), 1);

// src/utils/parse-http-error.ts
var import_axios = __toESM(require("axios"), 1);
var parseHttpError = (error) => {
  if (import_axios.default.isAxiosError(error)) {
    if (error.response) {
      return JSON.stringify({
        data: error.response.data,
        headers: error.response.headers,
        status: error.response.status
      });
    } else if (error.request && !(error.request instanceof XMLHttpRequest)) {
      return JSON.stringify(error.request);
    } else {
      return JSON.stringify({ code: error.code, message: error.message });
    }
  } else {
    return JSON.stringify(error);
  }
};

// src/begin.ts
var BeginProvider = class {
  apikey;
  chainNumber = 1815;
  domainUrl = ".bgin.id";
  /**
   * Creates a new instance of the BeginProvider.
   * @param apikey The API key for querying Begin ID.
   */
  constructor(apikey) {
    this.apikey = apikey ?? "31cab9edcc1c530e29924a56167d4ed17d50b7fds";
  }
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
  async resolveAddress(name, url) {
    try {
      const axiosInstance = import_axios2.default.create({
        baseURL: url ?? "https://resolveidaddress-ylo5dtxzdq-uc.a.run.app",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.apikey
        }
      });
      const { data, status } = await axiosInstance.post(``, {
        name: name.replace("@", "").replace(/(\.bgin\.id|\.beginid\.io|\.bgn\.is)$/, ""),
        chain: this.chainNumber
      });
      if (status === 200) {
        const result = data.result;
        return {
          name: result.name,
          domain: `${"".concat(result.name, this.domainUrl)}`,
          image: result.image,
          address: result.addresses[this.chainNumber]
        };
      }
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
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
  async resolveAdressReverse(address, url) {
    try {
      const axiosInstance = import_axios2.default.create({
        baseURL: url ?? "https://resolveIdReserveAddress-ylo5dtxzdq-uc.a.run.app",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.apikey
        }
      });
      const { data, status } = await axiosInstance.post(``, {
        address,
        chain: this.chainNumber
      });
      if (status === 200) {
        const result = data.result;
        return {
          name: result.name,
          domain: `${"".concat(result.name, this.domainUrl)}`,
          image: result.image,
          address: result.addresses[this.chainNumber]
        };
      }
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
};

// src/blockfrost.ts
var import_axios3 = __toESM(require("axios"), 1);
var import_common2 = require("@meshsdk/common");
var import_core_cst = require("@meshsdk/core-cst");

// src/utils/parse-asset-unit.ts
var import_common = require("@meshsdk/common");
var parseAssetUnit = (unit) => {
  const policyId = unit.slice(0, import_common.POLICY_ID_LENGTH);
  const assetName = unit.includes(".") ? (0, import_common.fromUTF8)(unit.split(".")[1] || "") : unit.slice(import_common.POLICY_ID_LENGTH);
  return { policyId, assetName };
};

// src/blockfrost.ts
var BlockfrostProvider = class {
  _axiosInstance;
  _network;
  constructor(...args) {
    if (typeof args[0] === "string" && (args[0].startsWith("http") || args[0].startsWith("/"))) {
      this._axiosInstance = import_axios3.default.create({ baseURL: args[0] });
      this._network = "mainnet";
    } else {
      const projectId = args[0];
      const network = projectId.slice(0, 7);
      this._axiosInstance = import_axios3.default.create({
        baseURL: `https://cardano-${network}.blockfrost.io/api/v${args[1] ?? 0}`,
        headers: { project_id: projectId }
      });
      this._network = network;
    }
  }
  async evaluateTx(cbor) {
    try {
      const headers = { "Content-Type": "application/cbor" };
      const { status, data } = await this._axiosInstance.post(
        "utils/txs/evaluate",
        cbor,
        {
          headers
        }
      );
      if (status === 200 && data.result.EvaluationResult) {
        const tagMap = {
          spend: "SPEND",
          mint: "MINT",
          certificate: "CERT",
          withdrawal: "REWARD"
        };
        const result = [];
        Object.keys(data.result.EvaluationResult).forEach((key) => {
          const [tagKey, index] = key.split(":");
          const { memory, steps } = data.result.EvaluationResult[key];
          result.push({
            tag: tagMap[tagKey],
            index: Number(index),
            budget: { mem: memory, steps }
          });
        });
        return result;
      }
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchAccountInfo(address) {
    const rewardAddress = address.startsWith("addr") ? (0, import_core_cst.resolveRewardAddress)(address) : address;
    try {
      const { data, status } = await this._axiosInstance.get(
        `accounts/${rewardAddress}`
      );
      if (status === 200 || status == 202)
        return {
          poolId: data.pool_id,
          active: data.active || data.active_epoch !== null,
          balance: data.controlled_amount,
          rewards: data.withdrawable_amount,
          withdrawals: data.withdrawals_sum
        };
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchAddressUTxOs(address, asset) {
    const filter = asset !== void 0 ? `/${asset}` : "";
    const url = `addresses/${address}/utxos` + filter;
    const paginateUTxOs = async (page = 1, utxos = []) => {
      const { data, status } = await this._axiosInstance.get(
        `${url}?page=${page}`
      );
      if (status === 200 || status == 202)
        return data.length > 0 ? paginateUTxOs(page + 1, [
          ...utxos,
          ...await Promise.all(
            data.map(
              (utxo) => this.toUTxO(utxo, utxo.tx_hash)
            )
          )
        ]) : utxos;
      throw parseHttpError(data);
    };
    try {
      return await paginateUTxOs();
    } catch (error) {
      return [];
    }
  }
  async fetchAssetAddresses(asset) {
    const paginateAddresses = async (page = 1, addresses = []) => {
      const { policyId, assetName } = parseAssetUnit(asset);
      const { data, status } = await this._axiosInstance.get(
        `assets/${policyId}${assetName}/addresses?page=${page}`
      );
      if (status === 200 || status == 202)
        return data.length > 0 ? paginateAddresses(page + 1, [...addresses, ...data]) : addresses;
      throw parseHttpError(data);
    };
    try {
      return await paginateAddresses();
    } catch (error) {
      return [];
    }
  }
  async fetchAssetMetadata(asset) {
    try {
      const { policyId, assetName } = parseAssetUnit(asset);
      const { data, status } = await this._axiosInstance.get(
        `assets/${policyId}${assetName}`
      );
      if (status === 200 || status == 202)
        return {
          ...data.onchain_metadata
        };
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchLatestBlock() {
    try {
      const { data, status } = await this._axiosInstance.get(`blocks/latest`);
      if (status === 200 || status == 202)
        return {
          confirmations: data.confirmations,
          epoch: data.epoch,
          epochSlot: data.epoch_slot.toString(),
          fees: data.fees,
          hash: data.hash,
          nextBlock: data.next_block ?? "",
          operationalCertificate: data.op_cert,
          output: data.output ?? "0",
          previousBlock: data.previous_block,
          size: data.size,
          slot: data.slot.toString(),
          slotLeader: data.slot_leader ?? "",
          time: data.time,
          txCount: data.tx_count,
          VRFKey: data.block_vrf
        };
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchBlockInfo(hash) {
    try {
      const { data, status } = await this._axiosInstance.get(`blocks/${hash}`);
      if (status === 200 || status == 202)
        return {
          confirmations: data.confirmations,
          epoch: data.epoch,
          epochSlot: data.epoch_slot.toString(),
          fees: data.fees,
          hash: data.hash,
          nextBlock: data.next_block ?? "",
          operationalCertificate: data.op_cert,
          output: data.output ?? "0",
          previousBlock: data.previous_block,
          size: data.size,
          slot: data.slot.toString(),
          slotLeader: data.slot_leader ?? "",
          time: data.time,
          txCount: data.tx_count,
          VRFKey: data.block_vrf
        };
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchCollectionAssets(policyId, cursor = 1) {
    try {
      const { data, status } = await this._axiosInstance.get(
        `assets/policy/${policyId}?page=${cursor}`
      );
      if (status === 200 || status == 202)
        return {
          assets: data.map((asset) => ({
            unit: asset.asset,
            quantity: asset.quantity
          })),
          next: data.length === 100 ? cursor + 1 : null
        };
      throw parseHttpError(data);
    } catch (error) {
      return { assets: [], next: null };
    }
  }
  async fetchHandle(handle) {
    if (this._network !== "mainnet") {
      throw new Error(
        "Does not support fetching addresses by handle on non-mainnet networks."
      );
    }
    try {
      const assetName = (0, import_common2.fromUTF8)(`${handle.replace("$", "")}`);
      const asset = await this.fetchAssetMetadata(
        `${import_common2.SUPPORTED_HANDLES[1]}000de140${assetName}`
      );
      return asset;
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchHandleAddress(handle) {
    if (this._network !== "mainnet") {
      throw new Error(
        "Does not support fetching addresses by handle on non-mainnet networks."
      );
    }
    try {
      const assetName = (0, import_common2.fromUTF8)(handle.replace("$", ""));
      const { data, status } = await this._axiosInstance.get(
        `assets/${import_common2.SUPPORTED_HANDLES[1]}${assetName}/addresses`
      );
      if (status === 200 || status == 202) return data[0].address;
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchProtocolParameters(epoch = Number.NaN) {
    try {
      const { data, status } = await this._axiosInstance.get(
        `epochs/${isNaN(epoch) ? "latest" : epoch}/parameters`
      );
      if (status === 200 || status == 202)
        return (0, import_common2.castProtocol)({
          coinsPerUtxoSize: data.coins_per_utxo_word,
          collateralPercent: data.collateral_percent,
          decentralisation: data.decentralisation_param,
          epoch: data.epoch,
          keyDeposit: data.key_deposit,
          maxBlockExMem: data.max_block_ex_mem,
          maxBlockExSteps: data.max_block_ex_steps,
          maxBlockHeaderSize: data.max_block_header_size,
          maxBlockSize: data.max_block_size,
          maxCollateralInputs: data.max_collateral_inputs,
          maxTxExMem: data.max_tx_ex_mem,
          maxTxExSteps: data.max_tx_ex_steps,
          maxTxSize: data.max_tx_size,
          maxValSize: data.max_val_size,
          minFeeA: data.min_fee_a,
          minFeeB: data.min_fee_b,
          minPoolCost: data.min_pool_cost,
          poolDeposit: data.pool_deposit,
          priceMem: data.price_mem,
          priceStep: data.price_step
        });
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchTxInfo(hash) {
    try {
      const { data, status } = await this._axiosInstance.get(`txs/${hash}`);
      if (status === 200 || status == 202)
        return {
          block: data.block,
          deposit: data.deposit,
          fees: data.fees,
          hash: data.hash,
          index: data.index,
          invalidAfter: data.invalid_hereafter ?? "",
          invalidBefore: data.invalid_before ?? "",
          slot: data.slot.toString(),
          size: data.size
        };
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchUTxOs(hash) {
    try {
      const { data, status } = await this._axiosInstance.get(
        `txs/${hash}/utxos`
      );
      if (status === 200 || status == 202) {
        const bfOutputs = data.outputs;
        const outputsPromises = [];
        bfOutputs.forEach((output) => {
          outputsPromises.push(this.toUTxO(output, hash));
        });
        const outputs = await Promise.all(outputsPromises);
        return outputs;
      }
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  onTxConfirmed(txHash, callback, limit = 100) {
    let attempts = 0;
    const checkTx = setInterval(() => {
      if (attempts >= limit) clearInterval(checkTx);
      this.fetchTxInfo(txHash).then((txInfo) => {
        this.fetchBlockInfo(txInfo.block).then((blockInfo) => {
          if (blockInfo?.confirmations > 0) {
            clearInterval(checkTx);
            callback();
          }
        }).catch(() => {
          attempts += 1;
        });
      }).catch(() => {
        attempts += 1;
      });
    }, 5e3);
  }
  async submitTx(tx) {
    try {
      const headers = { "Content-Type": "application/cbor" };
      const { data, status } = await this._axiosInstance.post(
        "tx/submit",
        (0, import_common2.toBytes)(tx),
        { headers }
      );
      if (status === 200 || status == 202) return data;
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  resolveScriptRef = async (scriptHash) => {
    if (scriptHash) {
      const { data, status } = await this._axiosInstance.get(
        `scripts/${scriptHash}`
      );
      if (status === 200 || status == 202) {
        const script = data.type.startsWith("plutus") ? {
          code: await this.fetchPlutusScriptCBOR(scriptHash),
          version: data.type.replace("plutus", "")
        } : await this.fetchNativeScriptJSON(scriptHash);
        return (0, import_core_cst.toScriptRef)(script).toCbor().toString();
      }
      throw parseHttpError(data);
    }
    return void 0;
  };
  toUTxO = async (bfUTxO, tx_hash) => ({
    input: {
      outputIndex: bfUTxO.output_index,
      txHash: tx_hash
    },
    output: {
      address: bfUTxO.address,
      amount: bfUTxO.amount,
      dataHash: bfUTxO.data_hash ?? void 0,
      plutusData: bfUTxO.inline_datum ?? void 0,
      scriptRef: bfUTxO.reference_script_hash ? await this.resolveScriptRef(bfUTxO.reference_script_hash) : void 0,
      scriptHash: bfUTxO.reference_script_hash
    }
  });
  async fetchPlutusScriptCBOR(scriptHash) {
    const { data, status } = await this._axiosInstance.get(
      `scripts/${scriptHash}/cbor`
    );
    if (status === 200 || status == 202) return data.cbor;
    throw parseHttpError(data);
  }
  async fetchNativeScriptJSON(scriptHash) {
    const { data, status } = await this._axiosInstance.get(
      `scripts/${scriptHash}/json`
    );
    if (status === 200 || status == 202) return data.json;
    throw parseHttpError(data);
  }
};

// src/koios.ts
var import_axios4 = __toESM(require("axios"), 1);
var import_common3 = require("@meshsdk/common");
var import_core_cst2 = require("@meshsdk/core-cst");
var KoiosProvider = class {
  _axiosInstance;
  _network;
  constructor(...args) {
    if (typeof args[0] === "string" && args[0].startsWith("http")) {
      this._axiosInstance = import_axios4.default.create({
        baseURL: args[0],
        headers: {
          Authorization: `Bearer ${args[1]}`
        }
      });
      this._network = "api";
    } else {
      let version = 1;
      if (typeof args[2] === "number") {
        version = args[2];
      }
      const config = {
        baseURL: `https://${args[0]}.koios.rest/api/v${version}`
      };
      this._network = args[0];
      if (typeof args[1] === "string") {
        config.headers = {
          Authorization: `Bearer ${args[1]}`
        };
      }
      this._axiosInstance = import_axios4.default.create(config);
    }
  }
  async fetchAccountInfo(address) {
    try {
      const rewardAddress = address.startsWith("addr") ? (0, import_core_cst2.resolveRewardAddress)(address) : address;
      const { data, status } = await this._axiosInstance.post("account_info", {
        _stake_addresses: [rewardAddress]
      });
      if (status === 200)
        return {
          poolId: data[0].delegated_pool,
          active: data[0].status === "registered",
          balance: data[0].total_balance.toString(),
          rewards: data[0].rewards_available,
          withdrawals: data[0].withdrawals
        };
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchAddressUTxOs(address, asset) {
    try {
      const { data, status } = await this._axiosInstance.post("address_info", {
        _addresses: [address]
      });
      if (status === 200) {
        const utxos = data.flatMap((info) => info.utxo_set).map((utxo) => this.toUTxO(utxo, address));
        return asset !== void 0 ? utxos.filter(
          (utxo) => utxo.output.amount.find((a) => a.unit === asset) !== void 0
        ) : utxos;
      }
      throw parseHttpError(data);
    } catch (error) {
      return [];
    }
  }
  async fetchAssetAddresses(asset) {
    try {
      const { policyId, assetName } = parseAssetUnit(asset);
      const { data, status } = await this._axiosInstance.get(
        `asset_addresses?_asset_policy=${policyId}&_asset_name=${assetName}`
      );
      if (status === 200)
        return data.map(
          (item) => ({
            address: item.payment_address,
            quantity: item.quantity
          })
        );
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchAssetMetadata(asset) {
    try {
      const { policyId, assetName } = parseAssetUnit(asset);
      const { data, status } = await this._axiosInstance.get(
        `asset_info?_asset_policy=${policyId}&_asset_name=${assetName}`
      );
      if (status === 200)
        return {
          ...data[0].minting_tx_metadata[721][policyId][(0, import_common3.toUTF8)(assetName)]
        };
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchBlockInfo(hash) {
    try {
      const { data, status } = await this._axiosInstance.post("block_info", {
        _block_hashes: [hash]
      });
      if (status === 200)
        return {
          confirmations: data[0].num_confirmations,
          epoch: data[0].epoch_no,
          epochSlot: data[0].epoch_slot.toString(),
          fees: data[0].total_fees ?? "",
          hash: data[0].hash,
          nextBlock: data[0].child_hash ?? "",
          operationalCertificate: data[0].op_cert,
          output: data[0].total_output ?? "0",
          previousBlock: data[0].parent_hash,
          size: data[0].block_size,
          slot: data[0].abs_slot.toString(),
          slotLeader: data[0].pool ?? "",
          time: data[0].block_time,
          txCount: data[0].tx_count,
          VRFKey: data[0].vrf_key
        };
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchCollectionAssets(policyId) {
    try {
      const { data, status } = await this._axiosInstance.get(
        `policy_asset_info?_asset_policy=${policyId}`
      );
      if (status === 200)
        return {
          assets: data.map((asset) => ({
            unit: `${asset.policy_id}${asset.asset_name}`,
            quantity: asset.total_supply
          }))
        };
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchHandle(handle) {
    if (this._network !== "api") {
      throw new Error(
        "Does not support fetching addresses by handle on non-mainnet networks."
      );
    }
    try {
      const assetName = (0, import_common3.fromUTF8)(`${handle.replace("$", "")}`);
      const asset = await this.fetchAssetMetadata(
        `${import_common3.SUPPORTED_HANDLES[1]}000de140${assetName}`
      );
      return asset;
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchHandleAddress(handle) {
    if (this._network !== "api") {
      throw new Error(
        "Does not support fetching addresses by handle on non-mainnet networks."
      );
    }
    try {
      const assetName = (0, import_common3.fromUTF8)(handle.replace("$", ""));
      const { data, status } = await this._axiosInstance.get(
        `asset_addresses?_asset_policy=${import_common3.SUPPORTED_HANDLES[1]}&_asset_name=${assetName}`
      );
      if (status === 200) return data[0].payment_address;
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchProtocolParameters(epoch = Number.NaN) {
    try {
      if (isNaN(epoch)) {
        const { data: data2 } = await this._axiosInstance.get(`tip`);
        epoch = data2[0].epoch_no;
      }
      const { data, status } = await this._axiosInstance.get(
        `epoch_params?_epoch_no=${epoch}`
      );
      if (status === 200)
        return (0, import_common3.castProtocol)({
          coinsPerUtxoSize: data[0].coins_per_utxo_size,
          collateralPercent: data[0].collateral_percent,
          decentralisation: data[0].decentralisation,
          epoch: data[0].epoch_no,
          keyDeposit: data[0].key_deposit,
          maxBlockExMem: data[0].max_block_ex_mem.toString(),
          maxBlockExSteps: data[0].max_block_ex_steps.toString(),
          maxBlockHeaderSize: data[0].max_bh_size,
          maxBlockSize: data[0].max_block_size,
          maxCollateralInputs: data[0].max_collateral_inputs,
          maxTxExMem: data[0].max_tx_ex_mem.toString(),
          maxTxExSteps: data[0].max_tx_ex_steps.toString(),
          maxTxSize: data[0].max_tx_size,
          maxValSize: data[0].max_val_size,
          minFeeA: data[0].min_fee_a,
          minFeeB: data[0].min_fee_b,
          minPoolCost: data[0].min_pool_cost,
          poolDeposit: data[0].pool_deposit,
          priceMem: data[0].price_mem,
          priceStep: data[0].price_step
        });
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchTxInfo(hash) {
    try {
      const { data, status } = await this._axiosInstance.post("tx_info", {
        _tx_hashes: [hash]
      });
      if (status === 200 && data.length == 1)
        return {
          block: data[0].block_hash,
          deposit: data[0].deposit,
          fees: data[0].fee,
          hash: data[0].tx_hash,
          index: data[0].tx_block_index,
          invalidAfter: data[0].invalid_after?.toString() ?? "",
          invalidBefore: data[0].invalid_before?.toString() ?? "",
          slot: data[0].absolute_slot.toString(),
          size: data[0].tx_size
        };
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchUTxOs(hash) {
    try {
      const { data, status } = await this._axiosInstance.post("tx_info", {
        _tx_hashes: [hash]
      });
      if (status === 200) {
        const utxos = data[0].outputs.map(
          (utxo) => this.toUTxO(utxo, "undefined")
        );
        return utxos;
      }
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  onTxConfirmed(txHash, callback, limit = 100) {
    let attempts = 0;
    const checkTx = setInterval(() => {
      if (attempts >= limit) clearInterval(checkTx);
      this.fetchTxInfo(txHash).then((txInfo) => {
        this.fetchBlockInfo(txInfo.block).then((blockInfo) => {
          if (blockInfo?.confirmations > 0) {
            clearInterval(checkTx);
            callback();
          }
        }).catch(() => {
          attempts += 1;
        });
      }).catch(() => {
        attempts += 1;
      });
    }, 5e3);
  }
  async submitTx(tx) {
    try {
      const headers = { "Content-Type": "application/cbor" };
      const { data, status } = await this._axiosInstance.post(
        "submittx",
        (0, import_common3.toBytes)(tx),
        { headers }
      );
      if (status === 202) return data;
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  toUTxO(utxo, address) {
    return {
      input: {
        outputIndex: utxo.tx_index,
        txHash: utxo.tx_hash
      },
      output: {
        address,
        amount: [
          { unit: "lovelace", quantity: utxo.value },
          ...utxo.asset_list.map(
            (a) => ({
              unit: `${a.policy_id}${a.asset_name}`,
              quantity: `${a.quantity}`
            })
          )
        ],
        dataHash: utxo.datum_hash ?? void 0,
        plutusData: utxo.inline_datum?.bytes ?? void 0,
        scriptRef: this.resolveScriptRef(utxo.reference_script),
        scriptHash: utxo.reference_script?.hash ?? void 0
      }
    };
  }
  resolveScriptRef = (kScriptRef) => {
    if (kScriptRef) {
      const script = kScriptRef.type.startsWith("plutus") ? {
        code: kScriptRef.bytes,
        version: kScriptRef.type.replace("plutus", "")
      } : (0, import_core_cst2.fromNativeScript)((0, import_core_cst2.deserializeNativeScript)(kScriptRef.bytes));
      if (script) return (0, import_core_cst2.toScriptRef)(script).toCbor().toString();
    }
    return void 0;
  };
};

// src/maestro.ts
var import_axios5 = __toESM(require("axios"), 1);
var import_common4 = require("@meshsdk/common");
var import_core_cst3 = require("@meshsdk/core-cst");
var MaestroProvider = class {
  _axiosInstance;
  _amountsAsStrings = {
    headers: {
      "amounts-as-strings": "true"
    }
  };
  _network;
  submitUrl;
  constructor({ network, apiKey, turboSubmit = false }) {
    this._axiosInstance = import_axios5.default.create({
      baseURL: `https://${network}.gomaestro-api.org/v1`,
      headers: { "api-key": apiKey }
    });
    this.submitUrl = turboSubmit ? "txmanager/turbosubmit" : "txmanager";
    this._network = network;
  }
  async evaluateTx(cbor) {
    try {
      const { data, status } = await this._axiosInstance.post(
        "transactions/evaluate",
        { cbor }
      );
      if (status === 200) {
        const tagMap = {
          spend: "SPEND",
          mint: "MINT",
          cert: "CERT",
          wdrl: "REWARD"
        };
        const result = data.map((action) => {
          const budget = action.ex_units;
          const index = action.redeemer_index;
          const tag = tagMap[action.redeemer_tag];
          return { budget, index, tag };
        });
        return result;
      }
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchAccountInfo(address) {
    const rewardAddress = address.startsWith("addr") ? (0, import_core_cst3.resolveRewardAddress)(address) : address;
    try {
      const { data: timestampedData, status } = await this._axiosInstance.get(
        `accounts/${rewardAddress}`,
        this._amountsAsStrings
      );
      if (status === 200) {
        const data = timestampedData.data;
        return {
          poolId: data.delegated_pool,
          active: data.registered,
          balance: data.total_balance,
          rewards: data.rewards_available,
          withdrawals: data.total_withdrawn
        };
      }
      throw parseHttpError(timestampedData);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchAddressUTxOs(address, asset) {
    const queryPredicate = (() => {
      if (address.startsWith("addr_vkh") || address.startsWith("addr_shared_vkh"))
        return `addresses/cred/${address}`;
      else return `addresses/${address}`;
    })();
    const appendAssetString = asset ? `&asset=${asset}` : "";
    const paginateUTxOs = async (cursor = null, utxos = []) => {
      const appendCursorString = cursor === null ? "" : `&cursor=${cursor}`;
      const { data: timestampedData, status } = await this._axiosInstance.get(
        `${queryPredicate}/utxos?count=100${appendAssetString}${appendCursorString}`,
        this._amountsAsStrings
      );
      if (status === 200) {
        const data = timestampedData.data;
        const pageUTxOs = data.map(this.toUTxO);
        const addedUtxos = [...utxos, ...pageUTxOs];
        const nextCursor = timestampedData.next_cursor;
        return nextCursor == null ? addedUtxos : paginateUTxOs(nextCursor, addedUtxos);
      }
      throw parseHttpError(timestampedData);
    };
    try {
      return await paginateUTxOs();
    } catch (error) {
      return [];
    }
  }
  async fetchAssetAddresses(asset) {
    const { policyId, assetName } = parseAssetUnit(asset);
    const paginateAddresses = async (cursor = null, addressesWithQuantity = []) => {
      const appendCursorString = cursor === null ? "" : `&cursor=${cursor}`;
      const { data: timestampedData, status } = await this._axiosInstance.get(
        `assets/${policyId}${assetName}/addresses?count=100${appendCursorString}`,
        this._amountsAsStrings
      );
      if (status === 200) {
        const data = timestampedData.data;
        const pageAddressesWithQuantity = data.map((a) => {
          return { address: a.address, quantity: a.amount };
        });
        const nextCursor = timestampedData.next_cursor;
        const addedData = [
          ...addressesWithQuantity,
          ...pageAddressesWithQuantity
        ];
        return nextCursor == null ? addedData : paginateAddresses(nextCursor, addedData);
      }
      throw parseHttpError(timestampedData);
    };
    try {
      return await paginateAddresses();
    } catch (error) {
      return [];
    }
  }
  async fetchAssetMetadata(asset) {
    try {
      const { policyId, assetName } = parseAssetUnit(asset);
      const { data: timestampedData, status } = await this._axiosInstance.get(
        `assets/${policyId}${assetName}`
      );
      if (status === 200) {
        const data = timestampedData.data;
        return {
          ...data.asset_standards.cip25_metadata,
          ...data.asset_standards.cip68_metadata
        };
      }
      throw parseHttpError(timestampedData);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchBlockInfo(hash) {
    try {
      const { data: timestampedData, status } = await this._axiosInstance.get(
        `blocks/${hash}`,
        this._amountsAsStrings
      );
      if (status === 200) {
        const data = timestampedData.data;
        return {
          confirmations: data.confirmations,
          epoch: data.epoch,
          epochSlot: data.epoch_slot.toString(),
          fees: data.total_fees,
          hash: data.hash,
          nextBlock: data.next_block ?? "",
          operationalCertificate: data.operational_certificate?.hot_vkey,
          output: data.total_output_lovelace ?? "0",
          previousBlock: data.previous_block,
          size: data.size,
          slot: data.absolute_slot.toString(),
          slotLeader: data.block_producer ?? "",
          time: Date.parse(data.timestamp) / 1e3,
          txCount: data.tx_hashes.length,
          VRFKey: import_core_cst3.VrfVkBech32.fromHex(data.vrf_key)
        };
      }
      throw parseHttpError(timestampedData);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchCollectionAssets(policyId, cursor) {
    try {
      const { data: timestampedData, status } = await this._axiosInstance.get(
        `policy/${policyId}/assets?count=100${cursor ? `&cursor=${cursor}` : ""}`
      );
      if (status === 200) {
        const data = timestampedData.data;
        return {
          assets: data.map((asset) => ({
            unit: policyId + asset.asset_name,
            quantity: asset.total_supply
          })),
          next: timestampedData.next_cursor
        };
      }
      throw parseHttpError(timestampedData);
    } catch (error) {
      return { assets: [], next: null };
    }
  }
  async fetchHandle(handle) {
    if (this._network !== "Mainnet") {
      throw new Error(
        "Does not support fetching addresses by handle on non-mainnet networks."
      );
    }
    try {
      const assetName = (0, import_common4.fromUTF8)(`${handle.replace("$", "")}`);
      const asset = await this.fetchAssetMetadata(
        `${import_common4.SUPPORTED_HANDLES[1]}000643b0${assetName}`
      );
      if (asset.metadata !== void 0) return asset.metadata;
      throw "Problem fetching metadata";
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchHandleAddress(handle) {
    if (this._network !== "Mainnet") {
      throw new Error(
        "Does not support fetching addresses by handle on non-mainnet networks."
      );
    }
    try {
      const handleWithoutDollar = handle.charAt(0) === "$" ? handle.substring(1) : handle;
      const { data: timestampedData, status } = await this._axiosInstance.get(
        `ecosystem/adahandle/${handleWithoutDollar}`
      );
      if (status === 200) return timestampedData.data;
      throw parseHttpError(timestampedData);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchProtocolParameters(epoch = Number.NaN) {
    if (!isNaN(epoch))
      throw new Error(
        "Maestro only supports fetching Protocol parameters of the latest completed epoch."
      );
    const decimalFromRationalString = (str) => {
      const forwardSlashIndex = str.indexOf("/");
      return parseInt(str.slice(0, forwardSlashIndex)) / parseInt(str.slice(forwardSlashIndex + 1));
    };
    try {
      const { data: timestampedData, status } = await this._axiosInstance.get("protocol-params");
      if (status === 200) {
        const data = timestampedData.data;
        try {
          const { data: timestampedDataEpochData, status: epochStatus } = await this._axiosInstance.get("epochs/current");
          if (epochStatus === 200) {
            const epochData = timestampedDataEpochData.data;
            return (0, import_common4.castProtocol)({
              coinsPerUtxoSize: parseInt(data.coins_per_utxo_byte),
              collateralPercent: parseInt(data.collateral_percentage),
              decentralisation: 0,
              // Deprecated in Babbage era.
              epoch: parseInt(epochData.epoch_no),
              keyDeposit: parseInt(data.stake_key_deposit),
              maxBlockExMem: data.max_execution_units_per_block.memory.toString(),
              maxBlockExSteps: data.max_execution_units_per_block.steps.toString(),
              maxBlockHeaderSize: parseInt(data.max_block_header_size),
              maxBlockSize: parseInt(data.max_block_body_size),
              maxCollateralInputs: parseInt(data.max_collateral_inputs),
              maxTxExMem: data.max_execution_units_per_transaction.memory.toString(),
              maxTxExSteps: data.max_execution_units_per_transaction.steps.toString(),
              maxTxSize: parseInt(data.max_tx_size),
              maxValSize: parseInt(data.max_value_sized),
              minFeeA: data.min_fee_coefficient,
              minFeeB: data.min_fee_constant,
              minPoolCost: data.min_pool_cost.toString(),
              poolDeposit: parseInt(data.pool_deposit),
              priceMem: decimalFromRationalString(data.prices.memory),
              priceStep: decimalFromRationalString(data.prices.steps)
            });
          }
          throw parseHttpError(timestampedDataEpochData);
        } catch (error) {
          throw parseHttpError(error);
        }
      }
      throw parseHttpError(timestampedData);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchTxInfo(hash) {
    try {
      const { data: timestampedData, status } = await this._axiosInstance.get(
        `transactions/${hash}`
      );
      if (status === 200) {
        const data = timestampedData.data;
        return {
          block: data.block_hash,
          deposit: data.deposit.toString(),
          fees: data.fee.toString(),
          hash: data.tx_hash,
          index: data.block_tx_index,
          invalidAfter: data.invalid_hereafter ?? "",
          invalidBefore: data.invalid_before ?? "",
          slot: data.block_absolute_slot.toString(),
          size: data.size - 1
        };
      }
      throw parseHttpError(timestampedData);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchUTxOs(hash) {
    try {
      const { data: timestampedData, status } = await this._axiosInstance.get(
        `transactions/${hash}`,
        this._amountsAsStrings
      );
      if (status === 200) {
        const msOutputs = timestampedData.data.outputs;
        const outputs = msOutputs.map(this.toUTxO);
        return outputs;
      }
      throw parseHttpError(timestampedData);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  onTxConfirmed(txHash, callback, limit = 100) {
    let attempts = 0;
    const checkTx = setInterval(() => {
      if (attempts >= limit) clearInterval(checkTx);
      this.fetchTxInfo(txHash).then((txInfo) => {
        this.fetchBlockInfo(txInfo.block).then((blockInfo) => {
          if (blockInfo?.confirmations > 0) {
            clearInterval(checkTx);
            callback();
          }
        }).catch(() => {
          attempts += 1;
        });
      }).catch(() => {
        attempts += 1;
      });
    }, 5e3);
  }
  async submitTx(tx) {
    try {
      const headers = { "Content-Type": "application/cbor" };
      const { data, status } = await this._axiosInstance.post(
        this.submitUrl,
        (0, import_common4.toBytes)(tx),
        { headers }
      );
      if (status === 202) return data;
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  toUTxO = (utxo) => ({
    input: {
      outputIndex: utxo.index,
      txHash: utxo.tx_hash
    },
    output: {
      address: utxo.address,
      amount: utxo.assets.map((asset) => ({
        unit: asset.unit,
        quantity: asset.amount
      })),
      dataHash: utxo.datum?.hash,
      plutusData: utxo.datum?.bytes,
      scriptRef: this.resolveScript(utxo),
      scriptHash: utxo.reference_script?.hash
    }
  });
  resolveScript = (utxo) => {
    if (utxo.reference_script) {
      const script = utxo.reference_script.type === "native" ? utxo.reference_script.json : {
        code: utxo.reference_script.bytes,
        version: utxo.reference_script.type.replace("plutusv", "V")
      };
      return (0, import_core_cst3.toScriptRef)(script).toCbor().toString();
    } else return void 0;
  };
};

// src/ogmios.ts
var import_common5 = require("@meshsdk/common");
var OgmiosProvider = class {
  _baseUrl;
  constructor(...args) {
    this._baseUrl = (0, import_common5.isNetwork)(args[0]) ? import_common5.SUPPORTED_OGMIOS_LINKS[args[0]] : args[0];
  }
  async evaluateTx(tx) {
    const client = await this.open();
    this.send(client, "EvaluateTx", {
      evaluate: tx
    });
    return new Promise((resolve, reject) => {
      client.addEventListener(
        "message",
        (response) => {
          try {
            const { result } = JSON.parse(response.data);
            if (result.EvaluationResult) {
              resolve(
                Object.keys(result.EvaluationResult).map((key) => {
                  return {
                    index: parseInt(key.split(":")[1], 10),
                    tag: key.split(":")[0].toUpperCase(),
                    budget: {
                      mem: result.EvaluationResult[key].memory,
                      steps: result.EvaluationResult[key].steps
                    }
                  };
                })
              );
            } else {
              reject(result.EvaluationFailure);
            }
            client.close();
          } catch (error) {
            reject(error);
          }
        },
        { once: true }
      );
    });
  }
  async onNextTx(callback) {
    const client = await this.open();
    this.send(client, "AwaitAcquire", {});
    client.addEventListener("message", (response) => {
      const { result } = JSON.parse(response.data);
      if (result === null) {
        return this.send(client, "AwaitAcquire", {});
      }
      if (result.AwaitAcquired === void 0) {
        callback(result);
      }
      this.send(client, "NextTx", {});
    });
    return () => client.close();
  }
  async submitTx(tx) {
    const client = await this.open();
    this.send(client, "SubmitTx", {
      submit: tx
    });
    return new Promise((resolve, reject) => {
      client.addEventListener(
        "message",
        (response) => {
          try {
            const { result } = JSON.parse(response.data);
            if (result.SubmitSuccess) {
              resolve(result.SubmitSuccess.txId);
            } else {
              reject(result.SubmitFail);
            }
            client.close();
          } catch (error) {
            reject(error);
          }
        },
        { once: true }
      );
    });
  }
  async open() {
    const client = new WebSocket(this._baseUrl);
    await new Promise((resolve) => {
      client.addEventListener("open", () => resolve(true), { once: true });
    });
    return client;
  }
  send(client, methodname, args) {
    client.send(
      JSON.stringify({
        version: "1.0",
        type: "jsonwsp/request",
        servicename: "ogmios",
        methodname,
        args
      })
    );
  }
};

// src/yaci.ts
var import_axios6 = __toESM(require("axios"), 1);
var import_common6 = require("@meshsdk/common");
var import_core_cst4 = require("@meshsdk/core-cst");
var YaciProvider = class {
  _axiosInstance;
  /**
   * Set the URL of the instance.
   * @param baseUrl The base URL of the instance.
   */
  constructor(baseUrl = "http://localhost:8080/api/v1/") {
    this._axiosInstance = import_axios6.default.create({
      baseURL: baseUrl
    });
  }
  async fetchAccountInfo(address) {
    const rewardAddress = address.startsWith("addr") ? (0, import_core_cst4.resolveRewardAddress)(address) : address;
    try {
      const { data, status } = await this._axiosInstance.get(
        `accounts/${rewardAddress}`
      );
      if (status === 200)
        return {
          poolId: data.pool_id,
          active: data.active || data.active_epoch !== null,
          balance: data.controlled_amount,
          rewards: data.withdrawable_amount,
          withdrawals: data.withdrawals_sum
        };
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  resolveScriptRef = async (scriptHash) => {
    if (scriptHash) {
      const { data, status } = await this._axiosInstance.get(
        `scripts/${scriptHash}`
      );
      if (status === 200) {
        const script = data.type.startsWith("plutus") ? {
          code: await this.fetchPlutusScriptCBOR(scriptHash),
          version: data.type.replace("plutus", "")
        } : await this.fetchNativeScriptJSON(scriptHash);
        return (0, import_core_cst4.toScriptRef)(script).toCbor();
      }
      throw parseHttpError(data);
    }
    return void 0;
  };
  toUTxO = async (bfUTxO, tx_hash) => ({
    input: {
      outputIndex: bfUTxO.output_index,
      txHash: tx_hash
    },
    output: {
      address: bfUTxO.address,
      amount: bfUTxO.amount.map((utxo) => {
        return { ...utxo, quantity: utxo.quantity.toString() };
      }),
      dataHash: bfUTxO.data_hash ?? void 0,
      plutusData: bfUTxO.inline_datum ?? void 0,
      scriptRef: bfUTxO.script_ref ? bfUTxO.script_ref : bfUTxO.reference_script_hash ? await this.resolveScriptRef(bfUTxO.reference_script_hash) : void 0,
      scriptHash: bfUTxO.reference_script_hash
    }
  });
  async fetchAddressUTxOs(address, asset) {
    const filter = asset !== void 0 ? `/${asset}` : "";
    const url = `addresses/${address}/utxos` + filter;
    const paginateUTxOs = async (page = 1, utxos = []) => {
      const { data, status } = await this._axiosInstance.get(
        `${url}?page=${page}`
      );
      if (status === 200)
        return data.length > 0 ? paginateUTxOs(page + 1, [
          ...utxos,
          ...await Promise.all(
            data.map((utxo) => this.toUTxO(utxo, utxo.tx_hash))
          )
        ]) : utxos;
      throw parseHttpError(data);
    };
    try {
      return await paginateUTxOs();
    } catch (error) {
      return [];
    }
  }
  async fetchAssetAddresses(asset) {
    const paginateAddresses = async (page = 1, addresses = []) => {
      const { policyId, assetName } = parseAssetUnit(asset);
      const { data, status } = await this._axiosInstance.get(
        `assets/${policyId}${assetName}/addresses?page=${page}`
      );
      if (status === 200)
        return data.length > 0 ? paginateAddresses(page + 1, [...addresses, ...data]) : addresses;
      throw parseHttpError(data);
    };
    try {
      return await paginateAddresses();
    } catch (error) {
      return [];
    }
  }
  async fetchAssetMetadata(asset) {
    try {
      const { policyId, assetName } = parseAssetUnit(asset);
      const { data, status } = await this._axiosInstance.get(
        `assets/${policyId}${assetName}`
      );
      if (status === 200)
        return {
          ...data.onchain_metadata
        };
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchBlockInfo(hash) {
    try {
      const { data, status } = await this._axiosInstance.get(`blocks/${hash}`);
      if (status === 200)
        return {
          confirmations: data.confirmations,
          epoch: data.epoch,
          epochSlot: data.epoch_slot.toString(),
          fees: data.fees,
          hash: data.hash,
          nextBlock: data.next_block ?? "",
          operationalCertificate: data.op_cert,
          output: data.output ?? "0",
          previousBlock: data.previous_block,
          size: data.size,
          slot: data.slot.toString(),
          slotLeader: data.slot_leader ?? "",
          time: data.time,
          txCount: data.tx_count,
          VRFKey: data.block_vrf
        };
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchCollectionAssets(policyId, cursor = 1) {
    try {
      const { data, status } = await this._axiosInstance.get(
        `assets/policy/${policyId}?page=${cursor}`
      );
      if (status === 200)
        return {
          assets: data.map((asset) => ({
            unit: asset.asset,
            quantity: asset.quantity
          })),
          next: data.length === 100 ? cursor + 1 : null
        };
      throw parseHttpError(data);
    } catch (error) {
      return { assets: [], next: null };
    }
  }
  async fetchHandle(handle) {
    throw new Error("Method not implemented.");
  }
  async fetchHandleAddress(handle) {
    try {
      const assetName = (0, import_common6.fromUTF8)(handle.replace("$", ""));
      const { data, status } = await this._axiosInstance.get(
        `assets/${import_common6.SUPPORTED_HANDLES[1]}${assetName}/addresses`
      );
      if (status === 200) return data[0].address;
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchProtocolParameters(epoch = Number.NaN) {
    try {
      const { data, status } = await this._axiosInstance.get(
        `epochs/${isNaN(epoch) ? "latest" : epoch}/parameters`
      );
      if (status === 200)
        return (0, import_common6.castProtocol)({
          coinsPerUtxoSize: data.coins_per_utxo_size,
          collateralPercent: data.collateral_percent,
          decentralisation: data.decentralisation_param,
          epoch: data.epoch,
          keyDeposit: data.key_deposit,
          maxBlockExMem: data.max_block_ex_mem,
          maxBlockExSteps: data.max_block_ex_steps,
          maxBlockHeaderSize: data.max_block_header_size,
          maxBlockSize: data.max_block_size,
          maxCollateralInputs: data.max_collateral_inputs,
          maxTxExMem: data.max_tx_ex_mem,
          maxTxExSteps: data.max_tx_ex_steps,
          maxTxSize: data.max_tx_size,
          maxValSize: data.max_val_size,
          minFeeA: data.min_fee_a,
          minFeeB: data.min_fee_b,
          minPoolCost: data.min_pool_cost,
          poolDeposit: data.pool_deposit,
          priceMem: data.price_mem,
          priceStep: data.price_step
        });
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchTxInfo(hash) {
    try {
      const { data, status } = await this._axiosInstance.get(`txs/${hash}`);
      if (status === 200)
        return {
          block: data.block,
          deposit: data.deposit,
          fees: data.fees,
          hash: data.hash,
          index: data.index,
          invalidAfter: data.invalid_hereafter ?? "",
          invalidBefore: data.invalid_before ?? "",
          slot: data.slot.toString(),
          size: data.size
        };
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchUTxOs(hash) {
    try {
      const { data, status } = await this._axiosInstance.get(
        `txs/${hash}/utxos`
      );
      if (status === 200) {
        const bfOutputs = data.outputs;
        const outputsPromises = [];
        bfOutputs.forEach((output) => {
          outputsPromises.push(this.toUTxO(output, hash));
        });
        const outputs = await Promise.all(outputsPromises);
        return outputs;
      }
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  onTxConfirmed(txHash, callback, limit = 100) {
    let attempts = 0;
    const checkTx = setInterval(() => {
      if (attempts >= limit) clearInterval(checkTx);
      this.fetchTxInfo(txHash).then((txInfo) => {
        this.fetchBlockInfo(txInfo.block).then((blockInfo) => {
          if (blockInfo?.confirmations > 0) {
            clearInterval(checkTx);
            callback();
          }
        }).catch(() => {
          attempts += 1;
        });
      }).catch(() => {
        attempts += 1;
      });
    }, 5e3);
  }
  async submitTx(txHex) {
    try {
      const headers = { "Content-Type": "text/plain" };
      const { status, data } = await this._axiosInstance.post(
        "/tx/submit",
        txHex,
        {
          headers
        }
      );
      if (status === 202) {
        return data;
      }
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async evaluateTx(txHex) {
    try {
      const headers = { "Content-Type": "application/cbor" };
      const { status, data } = await this._axiosInstance.post(
        "utils/txs/evaluate",
        txHex,
        {
          headers
        }
      );
      if (status === 202 && data.result.EvaluationResult) {
        const tagMap = {
          spend: "SPEND",
          mint: "MINT",
          certificate: "CERT",
          withdrawal: "REWARD"
        };
        const result = [];
        Object.keys(data.result.EvaluationResult).forEach((key) => {
          const [tagKey, index] = key.split(":");
          const { memory, steps } = data.result.EvaluationResult[key];
          result.push({
            tag: tagMap[tagKey],
            index: Number(index),
            budget: { mem: memory, steps }
          });
        });
        return result;
      }
      throw parseHttpError(data);
    } catch (error) {
      throw parseHttpError(error);
    }
  }
  async fetchPlutusScriptCBOR(scriptHash) {
    const { data, status } = await this._axiosInstance.get(
      `scripts/${scriptHash}/cbor`
    );
    if (status === 200) return data.cbor;
    throw parseHttpError(data);
  }
  async fetchNativeScriptJSON(scriptHash) {
    const { data, status } = await this._axiosInstance.get(
      `scripts/${scriptHash}/json`
    );
    if (status === 200) return data.json;
    throw parseHttpError(data);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BeginProvider,
  BlockfrostProvider,
  KoiosProvider,
  MaestroProvider,
  OgmiosProvider,
  YaciProvider
});
