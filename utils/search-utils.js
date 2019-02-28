
/**
 * 
 * Search utility functions.
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
const math = require('mathjs');

const printUtils = require('./print-utils.js');

function SearchUtils(searchParameters)
{
    this.hexaizeQuery = function(query)
    {
        // replace <<...>> with <...>, convert signatures 
        // to method IDs, and remove 0x prefix;
        let hexaizedQuery = query.slice(0, query.length);

        let signatureRegex = /\<\<[^\>]*\>\>/i;
        while(hexaizedQuery.match(signatureRegex))
        {
            let match = hexaizedQuery.match(signatureRegex)[0];
            let signature = match.replace(/\<\</i, '').replace(/\>\>/i, '').trim();
            if (signature.toUpperCase().startsWith('0X'))
            {
                signature = signature.replace(/0[xX]/i, '');
            }
            else
            {
                signature = ethers.utils.id(signature).replace(/0[xX]/i, '').slice(0,8);
            }
            hexaizedQuery = hexaizedQuery.replace(match, '<' + signature + '>');
        }

        return hexaizedQuery;
    }

    this.evaluateQueryToken = function(bytecode, queryToken)
    {
        // return 0 for false, 1 for true
        return (null != bytecode.toLowerCase().match(queryToken.toLowerCase()));
    }

    this.evaluateQuery = function(bytecode, hexaizedQuery)
    {
        // use '<...>' when parsing...
        
        let query = hexaizedQuery.slice(0, hexaizedQuery.length);
        
        let negatedSignatureRegex = /![\s]*\<[^\>]*\>/i;
        while(query.match(negatedSignatureRegex))
        {
            let match = query.match(negatedSignatureRegex)[0];
            let queryToken = match.replace(/![\s]*\</i, '').replace(/\>/i, '');
            let tokenValue = (this.evaluateQueryToken(bytecode, queryToken) + 1) % 2;

            query = query.replace(match, tokenValue);
        }
        
        let signatureRegex = /\<[^\>]*\>/i;
        while(query.match(signatureRegex))
        {
            let match = query.match(signatureRegex)[0];
            let queryToken = match.replace(/\</i, '').replace(/\>/i, '');
            let tokenValue = this.evaluateQueryToken(bytecode, queryToken);

            query = query.replace(match, tokenValue);
        }
        
        query = query.replace(/\&\&/g, '*');
        query = query.replace(/\|\|/g, '+');

        return math.eval(query);
    }

    this.foundMatch = function(bytecode)
    {
        let isMatch = false;

        let hexaizedQuery = this.hexaizedQuery;
        if (0 != this.evaluateQuery(bytecode, hexaizedQuery))
        {
            isMatch = true;
        }

        return isMatch;
    }

    this.setup = function()
    {
        this.hexaizedQuery = this.hexaizeQuery(this.query);
    }

    this.query = searchParameters.query;
    this.hexaizedQuery = null;
}

module.exports = (SearchUtils);
