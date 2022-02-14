<template>
  <transition name="fade">
    <div class="message" v-if="visible">
      <img
        v-show="messageType === 'success'"
        class="icon"
        src="../../assets/img/base/success.svg"
        alt="icon"
      >
      <span class="text">{{message}}</span>
    </div>
  </transition>
</template>

<script>

  import {isObject, isString} from "../../unit/utils";

  export default {
    name: "Message",
    data() {
      return {
        messageType: '', // success; error; warning
        message: '',
        visible: false,
      };
    },
    methods: {
      showMessage(arg) {
        this.visible = true;
        if (isString(arg)) {
          this.message = arg;
        } else if (isObject(arg)) {
          this.messageType = arg.type;
          this.message = arg.message;
        }

        setTimeout(() => {
          this.close();
        }, 2000);
      },
      close() {
        this.visible = false;
        this.$nextTick(() => {
          this.$destroy();
          this.$el.parentNode.removeChild(this.$el);
        });
      },
    },
  }
</script>

<style lang="less" scoped>
  .message {
    position: fixed;
    left: 0;
    right: 0;
    margin: auto;
    top: 20%;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 1.2rem;
    padding: 0 .6rem;
    border-radius: .2rem;
    background: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
    width: fit-content;
    .icon {
      width: .44rem;
      margin-right: .16rem;
    }
    .text {
      color: #000;
      font-size: .32rem;
    }
  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity .3s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>
