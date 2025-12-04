import asyncio
from typing import Callable, Any, Dict
from dataclasses import dataclass
from enum import Enum


class JobStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class Job:
    id: str
    func: Callable
    args: tuple
    kwargs: Dict[str, Any]
    status: JobStatus = JobStatus.PENDING
    result: Any = None
    error: str = None


class JobQueue:
    """Simple local job queue for processing video generation tasks."""
    
    def __init__(self, max_workers: int = 2):
        self.queue: asyncio.Queue = asyncio.Queue()
        self.jobs: Dict[str, Job] = {}
        self.max_workers = max_workers
        self.workers: list = []
        self.running = False
    
    async def add_job(
        self, job_id: str, func: Callable, *args, **kwargs
    ) -> str:
        """Add a job to the queue."""
        job = Job(
            id=job_id,
            func=func,
            args=args,
            kwargs=kwargs,
        )
        self.jobs[job_id] = job
        await self.queue.put(job)
        return job_id
    
    async def worker(self):
        """Worker coroutine that processes jobs."""
        while self.running:
            try:
                job = await asyncio.wait_for(self.queue.get(), timeout=1.0)
                job.status = JobStatus.RUNNING
                
                try:
                    if asyncio.iscoroutinefunction(job.func):
                        result = await job.func(*job.args, **job.kwargs)
                    else:
                        result = job.func(*job.args, **job.kwargs)
                    job.result = result
                    job.status = JobStatus.COMPLETED
                except Exception as e:
                    job.status = JobStatus.FAILED
                    job.error = str(e)
                
                self.queue.task_done()
            except asyncio.TimeoutError:
                continue
    
    async def start(self):
        """Start the job queue workers."""
        if self.running:
            return
        self.running = True
        self.workers = [
            asyncio.create_task(self.worker())
            for _ in range(self.max_workers)
        ]
    
    async def stop(self):
        """Stop the job queue workers."""
        self.running = False
        await self.queue.join()
        for worker in self.workers:
            worker.cancel()
        await asyncio.gather(*self.workers, return_exceptions=True)
        self.workers = []
    
    def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """Get the status of a job."""
        if job_id not in self.jobs:
            return {"error": "Job not found"}
        
        job = self.jobs[job_id]
        return {
            "id": job.id,
            "status": job.status.value,
            "result": job.result,
            "error": job.error,
        }


# Global job queue instance
job_queue = JobQueue()

