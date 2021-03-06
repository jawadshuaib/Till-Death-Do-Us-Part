<template>
  <div class="row">
    <Header></Header>
    <div class="container">
      <div class="card" v-if="error===null">
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
            target="_blank"
          >{{ url.note }}</router-link>
        </div>
      </div>
      <div class="card flow-text" v-if="error!==null">
        <div class="card-content red lighten-2 white-text">{{ error }}</div>
      </div>
      <!-- <button @click.prevent="getTransactionReceipt">Get Transaction Details</button> -->
    </div>
    <Footer></Footer>
  </div>
</template>
<script>
import Header from "./Header.vue";
import Footer from "./Footer.vue";
import blockchainHelpers from "@/helpers/blockchain";
import web3 from "./../web3";

// import notesContract from "./../notes";

let notesContract;

export default {
  name: "TransactionDetails",
  data() {
    return {
      error: "",
      url: {
        etherscan: "",
        note: ""
      },
      contract: {
        version: this.$route.params.version,
        transactionID: this.$route.params.transaction_id,
        token: this.$route.params.token,
        secretKey: this.$route.params.secretKey,
        whichNetwork: this.$route.params.whichNetwork,
        note: ""
      }
    };
  },
  components: {
    Header,
    Footer
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

    let hostName = window.location.hostname;
    hostName = hostName !== "localhost" ? `https://${hostName}` : hostName;
    this.url.note = `${hostName}/note/${this.contract.token}/${
      this.contract.whichNetwork
    }`;

    const version = this.contract.version;
    if ((await blockchainHelpers.doesContractVersionExist(version)) === true) {
      this.error = null;
      const contractDetails = await blockchainHelpers.getContract(version);
      const contractAddress = contractDetails[0];
      const contractAbi = JSON.parse(contractDetails[1]);

      notesContract = new web3.eth.Contract(contractAbi, contractAddress);

      this.contract.owner = await notesContract.methods.owner().call();
      this.getNote();
    } else {
      this.error = "Incorrect version specified for the note.";
    }
  },
  methods: {
    visitNotePage() {
      this.$router.push({
        name: "Note",
        params: {
          version: this.contract.version,
          token: this.form.token,
          whichNetwork: this.whichNetwork
        }
      });
    },
    updateURLParams() {
      this.transactionID = this.$route.params.transaction_id;
      this.token = this.$route.params.token;
    },
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

        // this.contract.dateCreated = c[0];
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
