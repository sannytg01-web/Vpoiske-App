import json
import logging
from typing import Dict, List, Any
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class ConnectionManager:
    """
    WebSocket Connection Manager with Redis Pub/Sub support.
    Manages active socket connections per match_id.
    """
    def __init__(self):
        # Local state for active websockets: match_id -> list[WebSocket]
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # We would normally hold a redis pool reference here
        
    async def connect(self, websocket: WebSocket, match_id: str, user_id: int):
        await websocket.accept()
        if match_id not in self.active_connections:
            self.active_connections[match_id] = []
        self.active_connections[match_id].append(websocket)
        logger.info(f"User {user_id} connected to chat {match_id}")
        # Note: In a real distributed app, we subscribe to a Redis channel here
        
    def disconnect(self, websocket: WebSocket, match_id: str):
        if match_id in self.active_connections:
            try:
                self.active_connections[match_id].remove(websocket)
                if not self.active_connections[match_id]:
                    del self.active_connections[match_id]
            except ValueError:
                pass

    async def broadcast(self, match_id: str, message: dict):
        # 1. Publish to Redis (Mocked here since we don't have a live redis pool for this demo)
        # redis.publish(f"chat:{match_id}", json.dumps(message))
        
        # 2. Distribute locally to connected sockets on this specific worker instance
        if match_id in self.active_connections:
            for connection in self.active_connections[match_id]:
                try:
                    await connection.send_json(message)
                except RuntimeError:
                    # Connection might be already closed
                    self.disconnect(connection, match_id)

    # Note: A real implementation would have a background task listening to Redis pubsub
    # async def redis_listener(self, match_id: str): ...

manager = ConnectionManager()
