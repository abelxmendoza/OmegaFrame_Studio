"""
WebSocket routes for real-time job progress.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.ws_manager import ws_manager

router = APIRouter()


@router.websocket("/ws/job/{job_id}")
async def ws_job(websocket: WebSocket, job_id: str):
    """WebSocket endpoint for job progress updates."""
    await ws_manager.connect(job_id, websocket)
    
    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connected",
            "job_id": job_id,
            "message": "Connected to job progress stream"
        })
        
        # Keep connection alive
        while True:
            try:
                # Wait for ping or any message to keep connection alive
                data = await websocket.receive_text()
                # Echo back to confirm connection
                if data == "ping":
                    await websocket.send_json({"type": "pong"})
            except WebSocketDisconnect:
                break
                
    except Exception as e:
        print(f"WebSocket error for job {job_id}: {e}")
    finally:
        ws_manager.disconnect(job_id, websocket)
