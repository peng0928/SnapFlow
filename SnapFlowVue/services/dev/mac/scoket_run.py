import asyncio
from web_socket import WebSocketAddon

if __name__ == '__main__':
    ws_addon = WebSocketAddon()
    asyncio.run(ws_addon.run_server())
