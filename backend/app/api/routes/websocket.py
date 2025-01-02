from openai import AsyncOpenAI
from starlette.websockets import WebSocketState

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import AsyncGenerator, NoReturn
from app.core.config import settings


router = APIRouter(prefix="/ws", tags=["websocket"])
client = AsyncOpenAI()

async def get_ai_response(message: str) -> AsyncGenerator[str, None]:
    """
    OpenAI Response
    """
    response = await client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a helpful assistant, skilled in explaining "
                    "complex concepts in simple terms."
                ),
            },
            {
                "role": "user",
                "content": message,
            },
        ],
        stream=True
    )

    all_content = ""
    async for chunk in response:
        content = chunk.choices[0].delta.content
        if content:
            all_content += content
            yield all_content

@router.websocket("/", dependencies=[])
async def websocket_openai(websocket: WebSocket) -> NoReturn:
    """
    Websocket for AI responses
    """
    await websocket.accept()

    while True:
        message = await websocket.receive_text()
        async for text in get_ai_response(message):
            await websocket.send_text(text)
