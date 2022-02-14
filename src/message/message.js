import Vue from 'vue';
import message from './Message.vue';

const messageConstructor = Vue.extend(message);

const Message = function (arg) {
  const instance = new messageConstructor().$mount();
  document.body.appendChild(instance.$el);
  instance.showMessage(arg);
};

export default Message;
