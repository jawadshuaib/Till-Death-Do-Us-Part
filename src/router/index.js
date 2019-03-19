import Vue from "vue";
import Router from "vue-router";
import TextForm from "@/components/TextForm";
import TransactionDetails from "@/components/TransactionDetails";
import Note from "@/components/Note";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      name: "TextForm",
      component: TextForm
    },
    {
      path: "/details/:transaction_id/:token/:secretKey/:whichNetwork",
      name: "TransactionDetails",
      component: TransactionDetails
    },
    {
      path: "/note/:token/:whichNetwork",
      name: "Note",
      component: Note
    }
  ]
});
