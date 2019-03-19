import notesContract from "./../notes";

export default {
  async doesTokenExist(token) {
    return await notesContract.methods.doesTokenExist(token).call();
  }
};
