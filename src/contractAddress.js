// This file contains the address and abi for the contract that keeps track
// of all other versions of the NotesEditable contract.
// Each time we modify the NotesEditable contract, we need to update the version in
// TextForm.vue and also submit this information to the contract through executing
// "node executeContract.js" under the /notes folder holding the contract.
// This will ensure that all users are able to access their past notes even when the contract
// has changed.
import web3 from "./web3";

const permanentAddress = "0xdb346c0564ec748c1dd38c90369b9f72e56e4d67";

const abi = [
  {
    constant: true,
    inputs: [{ name: "_version", type: "uint16" }],
    name: "doesVersionExist",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "_version", type: "uint16" }],
    name: "getContract",
    outputs: [{ name: "", type: "address" }, { name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "_version", type: "uint16" },
      { name: "_contractAddress", type: "address" },
      { name: "_abi", type: "string" }
    ],
    name: "addContractAddress",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "latestVersion",
    outputs: [{ name: "", type: "uint16" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor"
  }
];

// export a local copy of the contract (i.e. abi)
export default new web3.eth.Contract(abi, permanentAddress);
