<template>
  <div>
    <nav>
      <div class="nav-wrapper">
        <div class="col s12">
          <router-link to="/">
            <img src="../assets/logo-small.png">
          </router-link>
        </div>
      </div>
    </nav>
  </div>
</template>
<script>
export default {
  name: "Header",
  data() {
    return {};
  }
};
</script>
<style>
nav {
  background-color: #2bbbad;
}
</style>