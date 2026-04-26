const Web3 = require("web3");
require("dotenv").config();

const ABI = require("./AgriInsurance.json");

// 🔗 Connect to Ethereum (Sepolia via Infura)
const web3 = new Web3(process.env.RPC_URL);

// 🔐 Add wallet using private key
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

// 📜 Contract instance
const contract = new web3.eth.Contract(
    ABI,
    process.env.CONTRACT_ADDRESS
);

console.log("Using contract address:", process.env.CONTRACT_ADDRESS);

// 🌧 Update rainfall on blockchain (ORACLE FUNCTION)
async function updateWeatherOnChain(rainfall) {
    try {
        const tx = contract.methods.updateRainfall(rainfall);

        const gas = await tx.estimateGas({
            from: account.address
        });

        const receipt = await tx.send({
            from: account.address,
            gas
        });

        console.log("Rainfall updated on chain:", receipt.transactionHash);

        return receipt;

    } catch (error) {
        console.error("Blockchain Error (updateWeather):", error.message);
        throw error;
    }
}

// 📊 Get policy data from blockchain
async function getPolicy() {
    try {
        const policy = await contract.methods.getPolicy().call();

        console.log("Policy fetched:", policy);

        return policy;

    } catch (error) {
        console.error("Blockchain Error (getPolicy):", error.message);
        throw error;
    }
}

module.exports = {
    updateWeatherOnChain,
    getPolicy
};