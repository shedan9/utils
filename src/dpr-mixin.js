export default {
  created() {
    this.updateDPR();
    window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addListener(this.updateDPR);
  },
  data() {
    return {
      normalDpr: true,
    };
  },
  methods: {
    updateDPR() {
      const dpr = window.devicePixelRatio;
      this.normalDpr = dpr < 2;
    },
  },
}
