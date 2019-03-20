import web3 from "./../web3";
import notesContract from "./../notes";

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
  }
};
