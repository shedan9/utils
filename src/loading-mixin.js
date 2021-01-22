/**
 * mixin 引入是组件级别的，假如页面有多个loading，需要将多个loading块封装成组件，每个组件引入此mixin，否则对多个loading无效。
 */
import { mapState } from "vuex";
export default {
  data() {
    return {
      loading: false,
      needLoadingDelay: 300,
      loadingDelay: 400,
      currentLoading: 0,
      loadingEndFlag: false,
    };
  },
  computed: {
    ...mapState({
      apiErr: state => state.publicModule.apiErr
    }),
  },
  watch: {
    apiErr() {
      this.loadingEnd();
    },
  },
  methods: {
    initLoading() {
      this.loading = false;
      this.currentLoading = 0;
      this.loadingEndFlag = false;
    },
    loadingStart() {
      this.initLoading();
      // 设置一个loading出现的延迟时间，
      let t = setTimeout(() => {
        clearTimeout(t);
        if (!this.loadingEndFlag) {
          // needLoadingDelay之后数据还没有返回，说明网络太慢或者接口太慢，这时候真正打开loading
          this.loading = true;
          let t2 = setInterval(() => {
            this.currentLoading += 20;
            if (this.loadingEndFlag) {
              // loading效果还没有持续至loadingDelay，接口已经返回数据，则将loading效果持续至loadingDelay
              clearInterval(t2);
              let t3 = setTimeout(() => {
                clearTimeout(t3);
                this.loading = false;
              }, this.loadingDelay - this.currentLoading);
            }
            if (this.currentLoading >= this.loadingDelay) {
              // loading效果持续到了loadingDelay，接口还没返回数据，则只需清除定时器，等待loadingEnd的逻辑
              clearInterval(t2);
            }
          }, 20);
        }
      }, this.needLoadingDelay);
    },
    loadingEnd() {
      this.loadingEndFlag = true;
      if (this.currentLoading >= this.loadingDelay) {
        // 接口在loadingDelay之后才返回数据，则需要在接口返回的时候关闭loading
        this.loading = false;
      }
    },
  }
};
