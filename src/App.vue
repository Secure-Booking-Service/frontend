<template>
  <div id="wrapper">
      <!--Navbar Start-->
    <div id="nav">
      <router-link to="/">Home</router-link>
    </div>
    <!--Navbar Start-->

    <h1>Secure Boocing Service</h1>
    <br />
    <router-view />
    <!--Terminal Anzeige-->
    <br />
    <div>test</div>
  </div>
</template>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

#wrapper{
  text-align: center;
  margin: 0 auto;
}
</style>
