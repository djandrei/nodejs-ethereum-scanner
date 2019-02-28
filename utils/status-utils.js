
/**
 * 
 * Network status utility functions.
 * For any suggestions please contact me at andrei.dimitrief.jianu(at)gmail.com
 * 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2019 Andrei Dimitrief-Jianu
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */

const ethers = require('ethers');

const contractUtils = require('./contract-utils.js');
const printUtils = require('./print-utils.js');
const NetworkState = require('./network-state.js');

var statusUtils = 
{
    retrieveNetworkState: async function(client, port, password)
    {
        let networkState = new NetworkState();

        let provider = contractUtils.getProvider(client, port);
    
        let network = await provider.getNetwork();
        let blockNumber = await provider.getBlockNumber();
        let block = await provider.getBlock();
        let blockGasLimit = block.gasLimit;

        let deployer = 0;
        let wallet = 1;
    
        let deployerSigner = provider.getSigner(deployer);
        let walletSigner = provider.getSigner(wallet);

        if (!password)
        {
            printUtils.printToConsole('signer', 20, 'no password provided');
        }
        else
        {
            let deployerUnlocked = await deployerSigner.unlock(password);
            if (!deployerUnlocked)
            {
                printUtils.printToConsole('signer', 20, 'failed to unlock deployer');
                process.exit();
            }

            let walletUnlocked = await walletSigner.unlock(password);
            if (!walletUnlocked)
            {
                printUtils.printToConsole('signer', 20, 'failed to unlock wallet');
                process.exit();
            }
        }
    
        let deployerAddress = await deployerSigner.getAddress();
        let walletAddress = await walletSigner.getAddress();

        networkState.provider = provider;
        networkState.networkName = network.name;
        networkState.networkChainId = network.chainId;
        networkState.blockNumber = blockNumber;
        networkState.blockGasLimit = blockGasLimit;
        networkState.deployerSigner = deployerSigner;
        networkState.deployerAddress = deployerAddress;
        networkState.walletSigner = walletSigner;
        networkState.walletAddress = walletAddress;

        return networkState;
    },

    printNetworkStatus: async function(networkState)
    {
        printUtils.printNewLine();
        printUtils.printToConsole('network', 20, networkState.networkName);
        printUtils.printToConsole('chain id', 20, networkState.networkChainId);
        printUtils.printToConsole('block#', 20, networkState.blockNumber);
    },

    printContractStatus: async function(networkState, contractName, contractAddress)
    {
        if(!contractAddress || '' == contractAddress)
        {
            printUtils.printToConsole(contractName, 20, '-');
        }
        else
        {
            let ether = ethers.constants.WeiPerEther;
            let contractBalance = await networkState.provider.getBalance(contractAddress);
            printUtils.printToConsole(contractName, 20, contractAddress + ' : ' + contractBalance / ether + ' ETH');
        }
    }

}

module.exports = statusUtils;
