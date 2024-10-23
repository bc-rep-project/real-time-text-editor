
import asyncio
import websockets
import json

connected_clients = {}

async def handle_chat(websocket, path):
    document_id = path.split('/')[-1]
    if document_id not in connected_clients:
        connected_clients[document_id] = set()
    connected_clients[document_id].add(websocket)

    try:
        async for message in websocket:
            data = json.loads(message)
            await broadcast(data, document_id)
    finally:
        connected_clients[document_id].remove(websocket)

async def broadcast(message, document_id):
    if document_id in connected_clients:
        await asyncio.gather(
            *[client.send(json.dumps(message)) for client in connected_clients[document_id]]
        )

async def main():
    server = await websockets.serve(handle_chat, "localhost", 8080)
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())
