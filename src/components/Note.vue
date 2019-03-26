<template>
  <div class="row">
    <Header></Header>
    <div class="container">
      <div class="card">
        <div class="card-content" v-if="decrypted">
          <p>Save this link to access this note anytime in the future.</p>
        </div>
      </div>
      <div class="card flow-text" v-if="!decrypted">
        <div class="card-content">
          <p>Access the Encrypted Note</p>
          <div class="row">
            <div class="input-field col s12">
              <input id="secretKey" type="text" v-model="contract.secretKey">
              <label for="secretKey">Secret Key</label>
            </div>
            <div class="error" v-if="error!==null">{{ error }}</div>
          </div>
        </div>
        <div class="card-action">
          <button class="waves-effect waves-light btn-large" @click.prevent="getNote ()">
            <i class="material-icons left">wrap_text</i>Retrieve Note
          </button>
        </div>
      </div>
      <div class="card flow-text" v-else>
        <div class="card-content">
          <div class="progress" v-if="form.inProgress">
            <div class="indeterminate"></div>
          </div>
          <p v-if="!form.editMode">Decrypted Note from the Blockchain</p>
          <p v-else>Edit Note on the Blockchain</p>
          <blockquote>
            <span>{{ contract.noteCopy }}</span>
          </blockquote>
        </div>

        <!-- Only display the option below if it's from the author of the note -->
        <div v-if="form.isNoteOwner">
          <div class="card-action" v-if="!form.editMode">
            <button class="waves-effect waves-light btn-large" @click.prevent="form.editMode=true">
              <i class="material-icons left">edit</i>Edit this Note
            </button>
          </div>
          <div class="card-content" v-else>
            <div class="input-field">
              <textarea
                id="note"
                v-model="contract.noteCopy"
                class="materialize-textarea active"
                placeholder="Edit this Note"
              ></textarea>
            </div>
            <button class="waves-effect waves-light btn-large lighten-2" @click.prevent="goBack">
              <i class="material-icons left">replay</i>Go Back
            </button>&nbsp;
            <button class="waves-effect waves-light btn-large" @click.prevent="submitForm">
              <i class="material-icons left">notes</i>Edit Note
            </button>
          </div>
        </div>
      </div>
    </div>
    <Footer></Footer>
  </div>
</template>
<script>
import Header from "./Header.vue";
import Footer from "./Footer.vue";
import commonHelpers from "@/helpers/common";
import blockchainHelpers from "@/helpers/blockchain";
import web3 from "./../web3";
// import notesContract from "./../notes";
import CryptoJS from "crypto-js";

let notesContract;

export default {
  name: "Note",
  data() {
    return {
      contract: {
        version: this.$route.params.version,
        transactionHash: "",
        token: this.$route.params.token,
        whichNetwork: this.$route.params.whichNetwork,
        secretKey: "",
        dateCreated: 0,
        note: "",
        noteCopy: "",
        noteOwnerHashed: ""
      },
      form: {
        editMode: false,
        isNoteOwner: false,
        inProgress: false
      },
      decrypted: false,
      error: null
    };
  },
  components: {
    Header,
    Footer
  },
  async created() {
    // redirect if invalid token
    if (!blockchainHelpers.doesTokenExist(this.contract.token)) {
      this.$router.push({
        name: "/"
      });
    }

    const version = this.contract.version;
    if ((await blockchainHelpers.doesContractVersionExist(version)) === true) {
      this.error = null;
      const contractDetails = await blockchainHelpers.getContract(version);
      const contractAddress = contractDetails[0];
      const contractAbi = JSON.parse(contractDetails[1]);

      notesContract = new web3.eth.Contract(contractAbi, contractAddress);
    } else {
      this.error = "Incorrect version specified for the note.";
    }
  },
  methods: {
    // revert back to the original state
    goBack() {
      this.form.editMode = false;
      this.contract.noteCopy = this.contract.note;
    },
    // check if the current user is the author of the note
    async checkIfNoteOwner() {
      const account = await blockchainHelpers.getAccount();
      if (
        commonHelpers.encryptSHA256(account) == this.contract.noteOwnerHashed
      ) {
        this.form.isNoteOwner = true;
      }
    },
    async submitForm() {
      let canSubmit = false;
      if (this.contract.token !== null && this.contract.secretKey !== "") {
        canSubmit = true;
      }

      let editedNote = this.contract.noteCopy;
      if (canSubmit) {
        if (editedNote !== "" && editedNote !== this.contract.note) {
          // get the user's current account
          const account = await blockchainHelpers.getAccount();

          // encrypt the note
          editedNote = commonHelpers.encryptAES(
            editedNote,
            this.contract.secretKey
          );
          await notesContract.methods
            .editNote(
              this.contract.token,
              commonHelpers.encryptSHA256(account),
              editedNote
            )
            .send({
              from: account
            })
            .on("transactionHash", tx => {
              this.contract.transactionHash = tx;
              this.form.inProgress = true;
            })
            .on("confirmation", () => {
              this.$router.push({
                name: "TransactionDetails",
                params: {
                  transaction_id: this.contract.transactionHash,
                  token: this.contract.token,
                  secretKey: this.contract.secretKey,
                  whichNetwork: this.contract.whichNetwork
                }
              });
            });
        }
      }
    },
    async getNote() {
      this.error = null;
      let shouldGetNote = false;
      const secretKey = this.contract.secretKey;
      if (secretKey !== "") {
        shouldGetNote = true;
      } else {
        this.error = "Please enter a secret key to access this note.";
      }

      if (shouldGetNote) {
        const c = await notesContract.methods
          .getNote(this.contract.token)
          .call();

        let note = "";
        if (c[1] !== "") {
          note = CryptoJS.AES.decrypt(c[1], secretKey).toString(
            CryptoJS.enc.Utf8
          );
        } else {
          this.error = "Unable to retrieve note from the blockchain.";
        }

        if (note !== "") {
          this.contract.dateCreated = c[0];
          this.contract.note = note;
          this.contract.noteCopy = note;
          this.contract.noteOwnerHashed = c[2];

          this.checkIfNoteOwner();

          this.decrypted = true;
        } else {
          this.error = "Incorrect secret key provided. Please try again.";
        }
      }
    }
  }
};
</script>
<style>
#secretKey,
label {
  font-size: 22px;
  font-weight: lighter;
  color: #757575;
}
</style>
