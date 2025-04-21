import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const URL = "http://10.5.5.6/ws"; // 백엔드 WebSocket URL

const stompClient = new Client({
  webSocketFactory: () => new SockJS(URL),
  reconnectDelay: 5000, // 5초 후 재연결
});

export default stompClient;