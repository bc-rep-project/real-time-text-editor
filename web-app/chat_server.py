
import asyncio
import websockets
import json
from diff_match_patch import diff_match_patch
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

connected_clients = {}
document_contents = {}
document_versions = {}

async def handle_chat(websocket, path):
    document_id = path.split('/')[-1]
    if document_id not in connected_clients:
        connected_clients[document_id] = set()
        document_contents[document_id] = ""
        document_versions[document_id] = 0

    connected_clients[document_id].add(websocket)
    logger.info(f"New client connected for document {document_id}")

    try:
        await websocket.send(json.dumps({
            'type': 'init',
            'content': document_contents[document_id],
            'version': document_versions[document_id]
        }))

        async for message in websocket:
            data = json.loads(message)
            logger.info(f"Received message: {data}")
            if data['type'] == 'operation':
                if data['version'] == document_versions[document_id]:
                    dmp = diff_match_patch()
                    patches = dmp.patch_fromText(data['delta'])
                    new_content, _ = dmp.patch_apply(patches, document_contents[document_id])
                    document_contents[document_id] = new_content
                    document_versions[document_id] += 1
                    data['version'] = document_versions[document_id]
                    await broadcast(data, document_id)
            elif data['type'] == 'updateTitle':
                await broadcast(data, document_id)
    finally:
        connected_clients[document_id].remove(websocket)
        logger.info(f"Client disconnected from document {document_id}")

async def broadcast(message, document_id):
    if document_id in connected_clients:
        await asyncio.gather(
            *[client.send(json.dumps(message)) for client in connected_clients[document_id]]
        )
    logger.info(f"Broadcasted message to {len(connected_clients[document_id])} clients")

async def main():
    port = 8082  # Changed port to 8082
    server = await websockets.serve(handle_chat, "localhost", port)
    logger.info(f"WebSocket server started on port {port}")
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())
