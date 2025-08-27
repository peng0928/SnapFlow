import json
import os

from loguru import logger
import asyncio
import websockets
from datetime import datetime
import socket
from queue import Queue

# UDP配置
# TCP服务器配置
TCP_IP = "0.0.0.0"
TCP_PORT = 2025
BUFFER_SIZE = 1024 * 1024 * 60  # 1MB
# WebSocket客户端集合
connected_clients = set()
clientQueue = Queue()
port = 8765


class WebSocketAddon:
    def __init__(self):
        self.connected_clients = set()
        self.server = None
        self.periodic_task = None

    async def handle_connection(self, websocket):
        self.connected_clients.add(websocket)
        # logger.info(f"新客户端连接，当前连接数: {len(self.connected_clients)}")
        try:
            async for message in websocket:
                #                 logger.info(f"收到消息: {message}")
                await self.broadcast(f"用户说: {message}")
        except websockets.exceptions.ConnectionClosedError:
            #             logger.info("客户端异常断开")
            pass
        finally:
            self.connected_clients.remove(websocket)

    #             logger.info(f"客户端断开，剩余连接数: {len(self.connected_clients)}")

    async def broadcast(self, message):
        if not self.connected_clients:
            return
        await asyncio.gather(
            *[client.send(message) for client in self.connected_clients],
            return_exceptions=True
        )

    async def periodic_broadcast(self):
        while True:
            if self.connected_clients:
                await self.broadcast(f"服务器时间: {datetime.now().isoformat()}")
            while clientQueue.qsize() > 0:
                message = clientQueue.get()
                await self.broadcast(message)

            await asyncio.sleep(5)

    async def run_server(self):
        self.clear_process()
        asyncio.create_task(asyncio.to_thread(self.tcp_server))
        self.server = await websockets.serve(
            self.handle_connection,
            "localhost",
            port
        )
        logger.info("WebSocket服务器已启动，监听 ws://localhost:8765")
        # asyncio.create_task(asyncio.to_thread(await self.periodic_broadcast()))

    @staticmethod
    def clear_process():
        command = f"lsof -i :{port} | grep LISTEN | awk '{{print $2}}'"
        pids = os.popen(command).read().split()  # 获取所有 PID（列表）

        if pids:
            logger.info(f"Found processes {pids} using port {port}. Killing them...")
            for pid in pids:
                os.kill(int(pid), 9)  # 逐个终止
            logger.info("All processes killed.")
        else:
            logger.info(f"No process found using port {port}.")

    def tcp_server(self):
        """运行TCP服务端（在独立线程中）"""
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            s.bind((TCP_IP, TCP_PORT))
            s.listen()
            logger.info(f"TCP服务器启动 {TCP_IP}:{TCP_PORT}")

            while True:
                conn, addr = s.accept()
                with conn:
                    buffer = b""
                    while True:
                        chunk = conn.recv(BUFFER_SIZE)
                        if not chunk:
                            break
                        buffer += chunk
                        try:
                            data = json.loads(buffer.decode())
                            asyncio.run(self.broadcast(json.dumps(data)))
                        except json.JSONDecodeError:
                            continue  # 等待完整数据


if __name__ == '__main__':
    ws_addon = WebSocketAddon()
    asyncio.run(ws_addon.run_server())
