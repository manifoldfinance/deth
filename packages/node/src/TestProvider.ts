import { providers, Wallet, utils } from 'ethers'
import { TestChain } from './TestChain'
import { CHAIN_NAME, CHAIN_ID } from './constants'
import { RpcTransactionRequest } from './model'
import { makeQuantity, makeAddress, makeHexData } from './primitives'
import { TestProviderOptions, toTestChainOptions } from './TestProviderOptions'

export class TestProvider extends providers.BaseProvider {
  private chain: TestChain

  constructor (chainOrOptions?: TestChain | TestProviderOptions) {
    super({ name: CHAIN_NAME, chainId: CHAIN_ID })
    if (chainOrOptions instanceof TestChain) {
      this.chain = chainOrOptions
    } else {
      this.chain = new TestChain(toTestChainOptions(chainOrOptions))
    }
  }

  getWallets () {
    return this.chain.options.privateKeys.map(
      key => new Wallet(key, this),
    )
  }

  createEmptyWallet () {
    return Wallet.createRandom().connect(this)
  }

  async mineBlock () {
    return this.chain.mineBlock()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async perform (method: string, params: any) {
    switch (method) {
      case 'getBlockNumber':
        return this.chain.getBlockNumber()
      case 'getGasPrice':
        return this.chain.getGasPrice()
      case 'getBalance':
        return this.chain.getBalance(params.address, params.blockTag)
      case 'getTransactionCount':
        return this.chain.getTransactionCount(params.address, params.blockTag)
      case 'getCode':
        return this.chain.getCode(params.address, params.blockTag)
      case 'getStorageAt':
        return this.chain.getStorageAt(params.address, params.position, params.blockTag)
      case 'sendTransaction':
        return this.chain.sendTransaction(params.signedTransaction)
      case 'call':
        return this.chain.call(toRpcTransactionRequest(params.transaction), params.blockTag)
      case 'estimateGas':
        return this.chain.estimateGas(toRpcTransactionRequest(params.transaction))
      case 'getBlock':
        return this.chain.getBlock(params.blockTag ?? params.blockHash, params.includeTransactions)
      case 'getTransaction':
        return this.chain.getTransaction(params.transactionHash)
      case 'getTransactionReceipt':
        return this.chain.getTransactionReceipt(params.transactionHash)
      case 'getLogs':
        return this.chain.getLogs(params.filter)
      default:
        return super.perform(method, params)
    }
  }
}

function toRpcTransactionRequest (transaction: providers.TransactionRequest): RpcTransactionRequest {
  const result: RpcTransactionRequest = {}

  if (transaction.gasLimit) {
    result.gas = toQuantity(transaction.gasLimit)
  }
  if (transaction.gasPrice) {
    result.gasPrice = toQuantity(transaction.gasPrice)
  }
  if (transaction.nonce) {
    result.nonce = toQuantity(transaction.nonce)
  }
  if (transaction.value) {
    result.value = toQuantity(transaction.value)
  }
  if (transaction.from) {
    result.from = toAddress(transaction.from)
  }
  if (transaction.to) {
    result.to = toAddress(transaction.to)
  }
  if (transaction.data) {
    result.data = toHexData(transaction.data)
  }
  return result
}

const toQuantity = (value: any) => makeQuantity(utils.hexStripZeros(utils.hexlify(value)))
const toAddress = (value: any) => makeAddress(utils.hexlify(value))
const toHexData = (value: any) => makeHexData(utils.hexlify(value))