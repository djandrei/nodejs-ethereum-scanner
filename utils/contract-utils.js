
/**
 * 
 * Smart contract utility functions.
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
const fileSystem = require('fs');

var contractsUtils = 
{
    getProvider: function(client, port)
    {
        let provider = new ethers.providers.JsonRpcProvider('http://' + client + ':' + port);

        return provider;
    },

    getContractWithABI: function(contractAddress, contractABI, signer)
    {
        let contract = new ethers.Contract(contractAddress, contractABI, signer);

        return contract;    
    },

    getContractWithName: function(contractAddress, contractName, signer)
    {
        let contractJson = JSON.parse(fileSystem.readFileSync('./build/contracts/' + contractName + '.json'));
        let contractABI = contractJson.abi;

        let contract = new ethers.Contract(contractAddress, contractABI, signer);

        return contract;
    },

    deployContractWithABI: async function(contractABI, contractBytecode, signer, ...ctorParameters)
    {
        let contractFactory = new ethers.ContractFactory(contractABI, contractBytecode, signer);

        let contract = await contractFactory.deploy(...ctorParameters);
        await contract.deployed();

        return contract;
    },

    deployContractWithName: async function(contractName, signer, ...ctorParameters)
    {
        let contractJson = JSON.parse(fileSystem.readFileSync('./build/contracts/' + contractName + '.json'));
        let contractABI = contractJson.abi;
        let contractBytecode = contractJson.bytecode;

        let contractFactory = new ethers.ContractFactory(contractABI, contractBytecode, signer);

        let contract = await contractFactory.deploy(...ctorParameters);
        await contract.deployed();

        return contract;
    }
}

module.exports = contractsUtils;
