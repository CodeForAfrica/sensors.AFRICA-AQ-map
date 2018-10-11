<template lang="jade">
.sticky(:class="{stuck: stuck}")
	.fake(v-show="stuck", :style="{height: height + 'px'}")
	.sticky-wrap(v-el:wrap, :style="{top: marginTop + 'px'}")
		slot
</template>
<script>

export default {
	name: 'sticky',
	props: {
		marginTop: Number,
		height: Number //TODO compute this
	},
	data() {
		return {
			stuck: false,
			staticTop: 0
		}
	},
	ready() {
		this.saveCoordinates()
		document.addEventListener('scroll', this.scrollHandler, true)
		window.addEventListener('resize', this.saveCoordinates) //TODO throttle
	},
	beforeDestroy() {
		document.removeEventListener('scroll', this.scrollHandler, true)
		window.removeEventListener('resize', this.saveCoordinates)
	},
	methods: {
		saveCoordinates() {
			let rect = this.$el.getBoundingClientRect()
			let offsetTop = rect.top + window.scrollY
			this.staticTop = offsetTop
			this.$els.wrap.style.width = 'auto'
			this.$els.wrap.style.width = getComputedStyle(this.$el).width
		},
		scrollHandler(event) {
			if(this.relativeTop == 0)
				this.saveCoordinates()
			this.stuck = window.scrollY >= this.staticTop - this.marginTop
		}
	}
}
</script>
<style lang="stylus">
.stuck .sticky-wrap
	position fixed
	width inherit
	z-index 100
</style>
