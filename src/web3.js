import Web3 from "web3";
let web3;
if (window.ethereum) {
  // metamask is available
  window.ethereum.enable();
  web3 = new Web3(window.web3.currentProvider);
} else if (
  typeof window !== "undefined" &&
  typeof window.web3 !== "undefined"
) {
  // metamask is running
  web3 = new Web3(window.web3.currentProvider);
} else {
  //user is not running metamask
  // create provider through infura
  const provider = new Web3.providers.HttpProvider(
    // pass url of remote node
    "https://rinkeby.infura.io/v3/daaf8c15d76a4556b09db84a80530814"
  );
  web3 = new Web3(provider);
}
export default web3;
