Bcoin (Payment Channels)
========================

Mock Implementation of Payment Channels built on top of the Bcoin node. For learning purposes only, **not to be used on mainnet**.

Run a Bcoin Node on regtest:
----------------------------
```
./bin/bcoin --network=regtest
```

Run the Lnb Node:
-------------------
```
./bin/lnb
```

Interact with it using the Lnb-Client:
--------------------------------------
**create a wallet:**
```
./bin/lnb-cli create-wallet
```
it will respond with your recovery mnemonic

**open a channel:**
```
./bin/lnb-cli open-channel [public key] [satoshis]
```
it will respond with a funding transaction
