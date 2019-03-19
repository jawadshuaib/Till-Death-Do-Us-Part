<template>
  <div class="row">
    <Header></Header>
    <div class="container">
      <div class="card">
        <div class="card-content flow-text">
          <p>
            Your note has been encrypted and
            <a
              :href="`${url.etherscan}`"
              target="_blank"
            >posted on the blockchain</a>. Only someone with the secret key can retrieve your note.
          </p>
          <blockquote class="truncate">
            <strong>Encrypted Note:</strong>
            {{ contract.note }}
          </blockquote>
        </div>
        <div class="card-action flow-text">
          <div class="secret-key-desc">
            Secret Key:
            <span class="secret-key">{{ contract.secretKey }}</span>
          </div>
          <router-link
            class="truncate"
            :to="{ name: 'Note', params: { token: contract.token, whichNetwork: contract.whichNetwork } }"
          >{{ url.note }}</router-link>
        </div>
      </div>
      <!-- <button @click.prevent="getTransactionReceipt">Get Transaction Details</button> -->
    </div>
  </div>
</template>
<script>
import Header from "./Header.vue";
import commonHelpers from "@/helpers/common";
import blockchainHelpers from "@/helpers/blockchain";

import web3 from "./../web3";
import notesContract from "./../notes";

export default {
  name: "TransactionDetails",
  data() {
    return {
      url: {
        etherscan: "",
        note: ""
      },
      contract: {
        transactionID: this.$route.params.transaction_id,
        token: this.$route.params.token,
        secretKey: this.$route.params.secretKey,
        whichNetwork: this.$route.params.whichNetwork,
        note: ""
      }
    };
  },
  components: {
    Header
  },
  watch: {
    $route: "updateURLParams"
  },
  async created() {
    if (typeof this.contract.secretKey === "undefined") {
      this.$router.push({
        name: "TextForm"
      });
    }

    if (this.contract.whichNetwork === "mainnet") {
      this.url.etherscan =
        "https://etherscan.io/tx/" + String(this.contract.transactionID);
    } else {
      this.url.etherscan =
        "https://" +
        this.contract.whichNetwork +
        ".etherscan.io/tx/" +
        String(this.contract.transactionID);
    }

    const hostName = window.location.hostname;
    // https://till-death-do-us-part.firebaseapp.com
    this.url.note = `${hostName}/note/${this.contract.token}/${
      this.contract.whichNetwork
    }`;

    this.contract.owner = await notesContract.methods.owner().call();
    this.getNote();
  },
  methods: {
    visitNotePage() {
      this.$router.push({
        name: "Note",
        params: {
          token: this.form.token,
          whichNetwork: this.whichNetwork
        }
      });
    },
    updateURLParams() {
      this.transactionID = this.$route.params.transaction_id;
      this.token = this.$route.params.token;
    },
    // async getTransactionReceipt() {
    //   const trans = await web3.eth.getTransactionReceipt(
    //     this.contract.transactionID
    //   );
    // },
    async getNote() {
      let shouldGetNote = false;
      if (this.contract.token !== "") {
        shouldGetNote = true;
      }

      if (shouldGetNote) {
        if (blockchainHelpers.doesTokenExist(this.contract.token)) {
          shouldGetNote = true;
        } else {
          shouldGetNote = false;
        }
      }

      if (shouldGetNote) {
        const c = await notesContract.methods
          .getNote(this.contract.token)
          .call();

        this.contract.note = c[1];
      }
    }
  }
};
</script>
<style scoped>
.card-action a {
  text-transform: lowercase !important;
  padding: 5px;
  border-radius: 3px;
}
.secret-key-desc {
  color: #2bbbad;
  font-size: 32px;
  padding: 0 20px 20px 20px;
}
.secret-key {
  color: #26a69a;
}
</style>
