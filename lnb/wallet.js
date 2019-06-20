const fs = require('fs');
const bcoin = require('../lib/bcoin').set('regtest');
const network = bcoin.Network.get('regtest');
const KeyRing = bcoin.wallet.WalletKey;
const Mnemonic = bcoin.hd.Mnemonic;
const HD = bcoin.hd;

async function createWallet() {
  const mnemonic24 = new Mnemonic({bits: 256});
  const masterKey = HD.fromMnemonic(mnemonic24);
  fs.writeFileSync(`${network.type}-master-key.json`, JSON.stringify(masterKey.toJSON()))
  return mnemonic24.toString();
}

module.exports = { createWallet }
