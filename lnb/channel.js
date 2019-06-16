const fs = require('fs');
const bcoin = require('../lib/bcoin');
const KeyRing = bcoin.wallet.WalletKey;
const Script = bcoin.Script;
const network = bcoin.Network.get('regtest');
const MTX = bcoin.MTX;
const Coin = bcoin.Coin;

const {NodeClient} = require('bclient');

class Channel {
  constructor(options) {
    this.nodeClient = new NodeClient({
      network: network.type,
      port: network.rpcPort,
      apiKey: 'change-this-key'
    });
    this.m = 2;
    this.n = 2;
    this.keyRing = this._getKeyRing();
    this.address = this.keyRing.getAddress("string", network.type);
    this.peerPublicKey = Buffer.from(options.publicKey, "hex");
    this.satoshis = options.satoshis;
    this.fundingTx;
  }

  _getKeyRing() {
    try {
      const secret1 = fs.readFileSync(`./${network.type}-private-key.wif`).toString();
      const ring = KeyRing.fromSecret(secret1);
      return ring;
    } catch(err) {
      if (err.code == "ENOENT") {
        const _ring = KeyRing.generate(true, network.type);
        fs.writeFileSync(`${network.type}-private-key.wif`, _ring.toSecret(network.type));
        return getKeyRing()
      } else {
        throw(err)
      }
    }
  }

  fundingScript() {
    const pubKeys = [this.keyRing.publicKey, this.peerPublicKey];
    return Script.fromMultisig(this.m, this.n, pubKeys);
  }

  fundingAddress() {
    return this.fundingScript().getAddress().toBase58(network.type);
  }

  async fundChannel() {
    const mtx = new MTX();

    mtx.addOutput({
      address: this.fundingAddress(),
      value: this.satoshis,
    });

    const inputs = await this._generateInputs();
    await mtx.fund(inputs, {
      rate: 1000,
      changeAddress: this.address
    });

    // sign inputs
    inputs.forEach((input, i) => {
      mtx.scriptInput(i, input, this.keyRing);
      mtx.signInput(i, input, this.keyRing);
    })
    const fundingTX = mtx.toTX();
    this.fundingTX = fundingTX;
    return this.fundingTX;
  }

  async _generateInputs() {
    const txs = await this.nodeClient.getTXByAddress(this.address);
    let inputAmount = 0;
    const coins = [];
    while (inputAmount <= this.satoshis) {
      let tx = txs.shift();
      tx.outputs.forEach((utxo, i) => {
        if (inputAmount <= this.satoshis && utxo.address == this.address) {
          let coin = Coin.fromJSON({
            version: 1,
            height: -1,
            value: utxo.value,
            coinbase: false,
            script: utxo.script,
            hash: tx.hash,
            index: i,
          })

          coins.push(coin);
          inputAmount += utxo.value;
        }
      })
    }
    return coins;
  }

  buildCommitmentTX(newLocal, newRemote) {
    /*

    build a tx with funding tx as input and two outputs:
      local ouput: p2sh (RSMC):
        IF [secret_R] ELSE [050000] CHECKSEQUENCEVERIFY DROP [local_pub_key] ENDIF CHECKSIG
      remote ouput: ordinary P2PKH

    */


  }

}

module.exports = Channel;


// this is how you broadcast txs
// const broadcast = await nodeClient.broadcast(txHex);

