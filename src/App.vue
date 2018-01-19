
<template>
	<div id="app">
		<h1>Soc Pro!</h1>
		<Logo/>
	</div>
</template>


<script>
import Logo from './components/Logo.vue'
export default {
	components: {
		Logo
	}
}
</script>

<style lang="sass">
@import './sass/variables.sass'
*, *::before, *::after
	box-sizing: border-box
#app
	max-width: 100px
</style>
