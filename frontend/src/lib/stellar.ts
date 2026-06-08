import { isConnected, getAddress, requestAccess, signTransaction } from "@stellar/freighter-api";
import { Horizon, TransactionBuilder, Networks, Asset, Operation } from "@stellar/stellar-sdk";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const server = new Horizon.Server(HORIZON_URL);

export const connectFreighter = async () => {
  try {
    const connectionStatus = await isConnected();
    if (!connectionStatus.isConnected) {
      const access = await requestAccess();
      if (!access.address) {
        return null;
      }
    }

    const addressResponse = await getAddress();
    return addressResponse.address ?? null;
  } catch (error: any) {
    console.error('Freighter connection error', error);
    return null;
  }
};

export const investInGame = async (gameAssetCode: string, gameIssuer: string, amount: string) => {
  const addressResponse = await getAddress();
  if (!addressResponse.address) throw new Error("Wallet not connected");

  const account = await server.loadAccount(addressResponse.address);
  const asset = new Asset(gameAssetCode, gameIssuer);

  const transaction = new TransactionBuilder(account, {
    fee: (await server.fetchBaseFee()).toString(),
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.changeTrust({ asset, limit: amount }))
    .setTimeout(30)
    .build();

  const signedResponse = await signTransaction(transaction.toXDR());
  if (!signedResponse.signedTxXdr) {
    throw new Error('Transaction signing failed');
  }

  const result = await server.submitTransaction(TransactionBuilder.fromXDR(signedResponse.signedTxXdr, Networks.TESTNET));
  return result;
};
