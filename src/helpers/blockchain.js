import web3 from "./../web3";
import notesContract from "./../notes";
import contractAddress from "./../contractAddress";

export default {
  async doesTokenExist(token) {
    return await notesContract.methods.doesTokenExist(token).call();
  },
  async getAccount() {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      return null;
    }
    // assuming first account in metamask is the one the user wishes to use
    return accounts[0];
  },
  async getLatestContractVersion() {
    return await contractAddress.methods.latestVersion().call();
  },
  async getContract(version) {
    return await contractAddress.methods.getContract(version).call();
  },
  async doesContractVersionExist(version) {
    return await contractAddress.methods.doesVersionExist(version).call();
  }
};
