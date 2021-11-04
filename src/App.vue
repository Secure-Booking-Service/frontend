<template>
  <!--Navbar Start-->
  <div id="nav">
    <router-link to="/">Home</router-link>
  </div>
  <!--Navbar Ende-->

  <div id="wrapper">

    <h1>Secure Boocing Service</h1>
    <br />
    <div id="xterm">
    <router-view />
    </div>
    <!--Terminal Anzeige-->
    <br /><br />
    <div>testtesttest</div>
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
  text-align: center;
  margin: 0 auto;
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
  background: #645f5fcc;
  width: 90%;
  height: 90vh;
  border: 2px solid #645f5fcc;

}

#xterm{
  text-align: center;
  margin: 0 auto;
}
</style>
