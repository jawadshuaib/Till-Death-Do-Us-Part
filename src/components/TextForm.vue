<template>
  <div class="row">
    <div class="col s6 col-first hide-on-small-only">
      <div class="project-desc-container">
        <div class="project-desc">
          <div class="logo">
            <img src="../assets/logo.png">
          </div>
          <div class="headline">Is there is a message you would like to securely save forever?</div>
          <div
            class="desc"
          >Use the blockchain to store and share a message only you or your loved ones can view.</div>
        </div>
      </div>
    </div>
    <div class="col s6 col-second">
      <form class="form-container valign-wrapper align-center">
        <div>
          <div id="progress-bar-container">
            <div class="progress-bar-light-grey">
              <div
                id="progress-bar"
                class="progress-bar-strip progress-bar-green progress-bar-center"
                style="width:0%"
              >0%</div>
            </div>
          </div>
          <div class="input-field">
            <textarea id="note" v-model="form.note" class="materialize-textarea active"></textarea>
            <label for="note" v-if="isTest">{{ genericNote }} {{ networks.test }}.</label>
            <label for="note" v-else>{{ genericNote }} {{ networks.blockchain }}.</label>
          </div>
          <button
            class="btn waves-effect waves-light btn-large"
            type="submit"
            name="action"
            @click.prevent="submitForm()"
          >
            Save on the
            <span v-if="isTest">{{ networks.test }}</span>
            <span v-else>{{ networks.blockchain }}</span>
            <i class="material-icons right">send</i>
          </button>
          <div>
            <div class="error" v-if="error!==null">{{ error }}</div>
          </div>
          <div>
            <label>
              <input type="checkbox" v-on:click="selectNetwork($event)">
              <span>Permanently Save on the Blockchain (Costs Ether)</span>
            </label>
          </div>
        </div>
      </form>

      <Footer></Footer>
    </div>
  </div>
</template>

<script>
import commonHelpers from "@/helpers/common";
import blockchainHelpers from "@/helpers/blockchain";

import web3 from "./../web3";
import notesContract from "./../notes";

import CryptoJS from "crypto-js";

global.jQuery = require("jquery");
var $ = global.jQuery;
window.$ = $;

export default {
  name: "TextForm",
  data() {
    return {
      contract: {
        owner: null,
        transactionHash: null
      },
      networks: {
        test: "Test Network",
        blockchain: "Blockchain"
      },
      genericNote: "Write a note you wish to save on the Ethereum",
      isTest: true,
      note: null,
      form: {
        note: "",
        secretKey: "",
        token: ""
      },
      error: null
    };
  },
  methods: {
    selectNetwork(e) {
      if (e.target.checked) {
        this.isTest = false;
      } else {
        this.isTest = true;
      }
    },
    async submitForm() {
      this.form.token = commonHelpers.generateRandomDigits(8);
      this.form.secretKey = commonHelpers.generateRandomDigits(8);

      const token = this.form.token;

      let canSubmit = false;
      if (this.isFormValid()) {
        canSubmit = true;
      }

      if (!(await blockchainHelpers.doesTokenExist(token))) {
        canSubmit = true;
      } else {
        canSubmit = false;
        this.error =
          "A note with this token already exists. Please refresh and try again!";
      }

      if (canSubmit) {
        const dt = new Date();
        const dateCreated = dt.getTime();

        this.createNote(token, dateCreated, this.form.note);
      }
    },
    isFormValid() {
      this.error = null;
      if (this.form.note === "" || this.form.secretKey === "") {
        this.error = "Please write a note.";
      }
      return this.error === null ? true : false;
    },
    encryptNote(note) {
      return CryptoJS.AES.encrypt(note, this.form.secretKey).toString();
    },
    async createNote(token, dateCreated, note) {
      // submit the form
      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) {
        const err = "Please log into metamask account to proceed.";
        this.error = err;
        alert(err);
      }

      if (this.error === null) {
        // encrypt the note
        note = this.encryptNote(note);

        await notesContract.methods
          .createNote(token, dateCreated, note)
          .send({
            // assuming first account in metamask is the one the user wishes to use
            from: accounts[0]
          })
          .on("transactionHash", tx => {
            this.contract.transactionHash = tx;
            runProgressBar();
            this.$emit("animate", { action: true });
          })
          .on("confirmation", (confirmationNumber, receipt) => {
            console.log(
              `Confirmation Number ${confirmationNumber} | ${receipt}`
            );
            this.$emit("animate", { action: false });
            this.$router.push({
              name: "TransactionDetails",
              params: {
                transaction_id: this.contract.transactionHash,
                token: this.form.token,
                secretKey: this.form.secretKey,
                whichNetwork: this.isTest === true ? "rinkeby" : "mainnet"
              }
            });
          });
      }
    }
  },
  async created() {
    this.contract.owner = await notesContract.methods.owner().call();
  }
  // updated() {
  //   $(document).ready(function() {
  //     // resize textarea
  //     // M.updateTextFields();
  //     // M.textareaAutoResize($("#note"));
  //   });
  //   // $("document").on("keypress", function(e) {
  //   //   $("#note").focus();
  //   // });
  // }
};

$(document).ready(function() {
  // keep waves at the bottom as additional lines of the note are added
  $("#note").on("keypress", function(e) {
    const text = $(this).val();
    const lines = text.split(/\r|\r\n|\n/);
    const totalLines = lines.length;

    if (totalLines > 3) {
      if (e.which == 13) {
        $(".ocean").css("bottom", `-${totalLines * 48}px`);
      }
    }
  });
});

function runProgressBar() {
  const container = document.getElementById("progress-bar-container");
  container.style.display = "block";

  let elem = document.getElementById("progress-bar");
  let width = 0;
  let id = setInterval(frame, 200);
  function frame() {
    if (width >= 100) {
      elem.innerHTML = "Your note has been submitted successfully! Stand by...";
      clearInterval(id);
    } else {
      width++;
      elem.style.width = width + "%";
      elem.innerHTML = width * 1 + "%";
    }
  }
}
</script>

<style scoped>
#progress-bar-indeterminate {
  display: none;
}
.col-second {
  top: 0;
  min-height: 100vh;
  background-color: #fff;
  /* background-color: #fafbfb;
  background-image: url("data:image/svg+xml,%3Csvg width='36' height='36' viewBox='0 0 36 36' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M36 0H0v36h36V0zM15.126 2H2v13.126c.367.094.714.24 1.032.428L15.554 3.032c-.188-.318-.334-.665-.428-1.032zM18 4.874V18H4.874c-.094-.367-.24-.714-.428-1.032L16.968 4.446c.318.188.665.334 1.032.428zM22.874 2h11.712L20 16.586V4.874c1.406-.362 2.512-1.468 2.874-2.874zm10.252 18H20v13.126c.367.094.714.24 1.032.428l12.522-12.522c-.188-.318-.334-.665-.428-1.032zM36 22.874V36H22.874c-.094-.367-.24-.714-.428-1.032l12.522-12.522c.318.188.665.334 1.032.428zm0-7.748V3.414L21.414 18h11.712c.362-1.406 1.468-2.512 2.874-2.874zm-18 18V21.414L3.414 36h11.712c.362-1.406 1.468-2.512 2.874-2.874zM4.874 20h11.712L2 34.586V22.874c1.406-.362 2.512-1.468 2.874-2.874z' fill='%23ececec' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E"); */
}
.project-desc-container {
  position: absolute;
  top: 35%;
  transform: translateY(-50%);
  text-align: center;
  width: 48%;
}
.project-desc .logo img {
  max-width: 150px;
}
.project-desc .headline {
  color: #2bbbad;
  font-size: 32px;
  font-weight: 800;
}
.project-desc .desc {
  color: #757575;
  font-size: 16px;
}
.form-container {
  margin-left: auto;
  margin-right: auto;
  max-width: 600px;
  width: 100%;
  /* position: absolute; */
  /* top: 50%; */
  /* transform: translateY(-50%); */
}
#progress-bar-container {
  display: none;
}
.progress-bar-strip,
.progress-bar-panel {
  padding: 0.01em 16px;
}
.progress-bar-green,
.progress-bar-hover-green:hover {
  color: #fff;
  background-color: #4caf50;
}

.progress-bar-center {
  text-align: center;
}

.card-panel {
  background-color: #fff;
}
#note,
label,
#password {
  font-size: 22px;
  font-weight: lighter;
  color: #757575;
}
</style>