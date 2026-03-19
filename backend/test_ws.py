import asyncio
import websockets

async def test_ws():
    uri = "ws://127.0.0.1:8000/ws/events"
    try:
        print(f"Connecting to {uri}...")
        async with websockets.connect(uri) as ws:
            print("Connected!")
            resp = await ws.recv()
            print("Received:", resp[:100])
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(test_ws())
