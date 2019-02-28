### Ethereum scanner

The ethereum scanner is a free and open-source tool for contract exploration and discovery. The scanner supports regular expression queries that allow discovery of smart contracts with complex EVM patterns.

### Known issues

If using an ethereum client that does not run in full sync mode, there are some things you should be aware of:
- the current block number of the network might be 0 (provider.getBlockNumber() method returns zero);
- the contract balances displayed might not be accurate (provider.getBalance(contractAddress) returns zero);

Hence, the --block-end implicit value (the network block number) is not a valid block number, and the scan will fail. \
Also, the --balance option will filter out contracts that might have a non-zero balance.

### Command line examples for hex

The hex utility can be easily used to generate a function signature.

```
$ ./hex --input 'transferFrom(address,address,uint256)'
hex       0x23b872dd7302113369cda2901243429419bec145408fa8b352b3dd92b66c680b
$ ./hex --input 'transferFrom(address,address,uint256)' --signature
hex       0x23b872dd
```

### Command line examples for sc4nn3r

The --help option displays the available scan options.
```
$ ./scanner --help
Usage: scanner [options]

Options:
  -V, --version          output the version number
  --client <client>      ethereum client (default: "localhost")
  --port <port>          ethereum client rpc port
  --block-start <block>  block number scan start
  --block-end <block>    block number scan end
  --query <query>        query to execute
  --query-file <file>    file with query to execute
  --search-creation      search the data on the creation transaction
  --search-runtime       search the contract bytecode
  --balance              search only for contracts with non-zero balance
  --output-file <file>   file with list of contracts that matched the search criteria
  --status               displays status info during the scan
  --verbose              displays contract data during the scan
  --summary              displays summary at the end of the scan
  -h, --help             output usage information
```
Simple scan using a function signature in the query.
```
$ ./scanner --port 8545 --block-start 1 --block-end 1000 --query '<<transfer(address,uint256)>>'
```
Simple scan using a hexadecimal string in the query. Please note, the hexadecimal query supports regular expressions.
```
$ ./scanner --port 8545 --block-start 1 --block-end 1000 --query '<<0x21[0-9]{4}3131>>'
```
Scan with a function signature and a hexadecimal string. 
```
$ ./scanner --port 8545 --block-start 1 --block-end 1000 --query '<<transfer(address,uint256)>> && ! <<0x21[0-9]{4}3131>>'
```
Scan and display a summary.
```
$ ./scanner --port 8545 --block-start 1 --block-end 1000 --output-file 'scan-output.json' --summary --query '<<transfer(address,uint256)>>'
```
Example of a simple scan output.
```
$ ./scanner --port 14545 --block-start 7264275 --block-end 7264290 --query '<<transfer(address,uint256)>>' --output-file './scan-outputs/scan-20190227-2318.json' --status --summary --search-creation


client                    localhost
port                      14545
block start               7264275
block end                 7264290
query                     <<transfer(address,uint256)>>
search creation bytecode  true
search runtime bytecode   false
displays status during scan
displays summary at the end of the scan


signer              no password provided


network             homestead
chain id            1
block#              0


start block         7264275
end block           7264290
query               <<transfer(address,uint256)>>
hexaized query      <a9059cbb>


current block       7264275
current block       7264276
current block       7264277
current block       7264278
current block       7264279
current block       7264280
current block       7264281
current block       7264282
current block       7264283
current block       7264284


match ---------------------------------------
block number        7264284
transaction hash    0xc9a3f0b1d777fff614ace40881f8b111673b913f463b53cd04bc193a372eff98
contract address    0x5Bac8421aa6426B8B6A53C0cff5f198236484406
owner address       0x6d1803F1E66d923253A7457fC03d23F5a8e20763
transaction nonce   0
transaction value   0
contract balance    0
current block       7264285
current block       7264286
current block       7264287


match ---------------------------------------
block number        7264287
transaction hash    0x130214070b523ebd81e09da4d17511956d3ac42131da12b7c799c7be480bfae9
contract address    0x89511Af1116384E096A9f0BD7175A627B839529C
owner address       0xcDd37Ada79F589c15bD4f8fD2083dc88E34A2af2
transaction nonce   1278
transaction value   0
contract balance    0
current block       7264288
current block       7264289
current block       7264290


scan summary --------------------------------


contract            0x5Bac8421aa6426B8B6A53C0cff5f198236484406
owner               0x6d1803F1E66d923253A7457fC03d23F5a8e20763
block number        7264284
transaction hash    0xc9a3f0b1d777fff614ace40881f8b111673b913f463b53cd04bc193a372eff98
balance             0


contract            0x89511Af1116384E096A9f0BD7175A627B839529C
owner               0xcDd37Ada79F589c15bD4f8fD2083dc88E34A2af2
block number        7264287
transaction hash    0x130214070b523ebd81e09da4d17511956d3ac42131da12b7c799c7be480bfae9
balance             0


done.
scan: 17260.040ms

```
