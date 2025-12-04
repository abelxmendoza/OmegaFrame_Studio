"""
WebSocket manager for real-time job progress.
"""
from fastapi import WebSocket
from typing import Dict, List
import json


class WSManager:
    def __init__(self):
        self.active: Dict[str, List[WebSocket]] = {}

    async def connect(self, job_id: str, websocket: WebSocket):
        """Connect a WebSocket to a job channel."""
        await websocket.accept()
        if job_id not in self.active:
            self.active[job_id] = []
        self.active[job_id].append(websocket)
        print(f"WebSocket connected for job {job_id} (total: {len(self.active[job_id])})")

    def disconnect(self, job_id: str, websocket: WebSocket):
        """Disconnect a WebSocket from a job channel."""
        if job_id in self.active:
            try:
                self.active[job_id].remove(websocket)
                if not self.active[job_id]:
                    del self.active[job_id]
                print(f"WebSocket disconnected for job {job_id}")
            except ValueError:
                pass  # WebSocket not in list

    async def broadcast(self, job_id: str, message: dict):
        """Broadcast message to all WebSockets for a job."""
        if job_id in self.active:
            disconnected = []
            for ws in self.active[job_id]:
                try:
                    await ws.send_json(message)
                except Exception as e:
                    print(f"Error sending to WebSocket: {e}")
                    disconnected.append(ws)
            
            # Remove disconnected WebSockets
            for ws in disconnected:
                self.disconnect(job_id, ws)

    async def send_to_all(self, message: dict):
        """Send message to all connected WebSockets."""
        for job_id in list(self.active.keys()):
            await self.broadcast(job_id, message)


ws_manager = WSManager()
