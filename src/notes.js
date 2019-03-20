import web3 from "./web3";

const address = "0xc23484710345fa6e0888a1c8fb107be50ba6b899";

const abi = [
  {
    constant: false,
    inputs: [
      { name: "token", type: "string" },
      { name: "_dateCreated", type: "uint48" },
      { name: "_noteOwnerHashed", type: "string" },
      { name: "_encryptedNote", type: "string" }
    ],
    name: "createNote",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "token", type: "string" }],
    name: "doesTokenExist",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [{ name: "token", type: "string" }],
    name: "getNote",
    outputs: [
      { name: "", type: "uint48" },
      { name: "", type: "string" },
      { name: "", type: "string" }
    ],
    payable: false,
    stateMutability: "view",
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
    constant: false,
    inputs: [
      { name: "token", type: "string" },
      { name: "_noteOwnerHashed", type: "string" },
      { name: "_newNote", type: "string" }
    ],
    name: "editNote",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
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
export default new web3.eth.Contract(abi, address);
