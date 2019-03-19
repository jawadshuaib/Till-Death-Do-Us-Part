<template>
  <div class="row">
    <Header></Header>
    <div class="container">
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
          <p>Decrypted Note from the Blockchain</p>
          <blockquote>{{ contract.note }}</blockquote>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Header from "./Header.vue";
// import commonHelpers from "@/helpers/common";
import blockchainHelpers from "@/helpers/blockchain";

// import web3 from "./../web3";
import notesContract from "./../notes";

import CryptoJS from "crypto-js";

export default {
  name: "Note",
  data() {
    return {
      contract: {
        token: this.$route.params.token,
        whichNetwork: this.$route.params.whichNetwork,
        secretKey: "",
        note: ""
      },
      decrypted: false,
      error: null
    };
  },
  components: {
    Header
  },
  created() {
    // redirect if invalid token
    if (!blockchainHelpers.doesTokenExist(this.contract.token)) {
      //   this.$router.push({
      //     name: "/"
      //   });
    }
  },
  methods: {
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
          this.contract.note = note;
          this.decrypted = true;
        } else {
          this.error = "Incorrect secret key provided. Please try again.";
        }
      }
    }
    // getNote() {
    //   console.log(this.contract.token);
    //   console.log(this.contract.whichNetwork);
    // }
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
