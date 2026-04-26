import Web3 from "web3";
import ABI from "./abi/AgriInsurance.json";

let web3;
let contract;

// 🔗 Load Web3 (MetaMask)
export const loadWeb3 = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
  } else {
    alert("Please install MetaMask");
  }
};

// 📜 Load Contract
export const loadContract = async () => {
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

  contract = new web3.eth.Contract(ABI, contractAddress);

  console.log("Connected account:", account);
  console.log("Contract address:", contractAddress);

  return { contract, account };
};

// 📄 Create Policy (ADMIN ONLY)
export const createPolicy = async (
  contract,
  account,
  farmer,
  amount,
  threshold
) => {
  try {
    await contract.methods
      .createPolicy(farmer, amount, threshold)
      .send({ from: account });

    console.log("Policy created");
  } catch (error) {
    console.error("Create Policy Error:", error.message);
    throw error;
  }
};