import asyncio
import json
import logging
import re
from pathlib import Path

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

PROMPTS_DIR = Path(__file__).parent.parent.parent / "prompts"

def load_prompt(filename: str) -> str:
    return (PROMPTS_DIR / filename).read_text(encoding="utf-8")

INTERVIEW_PROMPT = load_prompt("agent_interview.md")

class AIAgent:
    def __init__(self):
        self.api_key = settings.yandex_api_key
        self.folder_id = settings.yandex_folder_id
        self.url = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"
        # Dummy semaphore for local dev if LLM_MAX_CONCURRENT is set
        self.semaphore = asyncio.Semaphore(settings.llm_max_concurrent)

    async def get_next_message(self, session_id: str, user_message: str | None, question_index: int, redis) -> dict:
        redis_key = f"interview:{session_id}"
        
        # 1. Загрузить историю
        history_data = await redis.get(redis_key)
        if history_data:
            history = json.loads(history_data)
        else:
            # 2. История пуста → создать системное сообщение
            history = [{"role": "system", "text": INTERVIEW_PROMPT}]

        # 3. Добавить user_message
        if user_message:
            history.append({"role": "user", "text": user_message})

        # 4. Вызвать LLM
        agent_reply = await self._call_yandexgpt(history)

        # 5. Добавить ответ агента
        if agent_reply:
            history.append({"role": "assistant", "text": agent_reply})

        # 6. Сохранить историю
        await self._save_history(session_id, history, redis)

        # 7. Обработка 18-го вопроса (JSON профиля)
        is_complete = question_index >= 18
        profile_json = None
        if is_complete and agent_reply:
            profile_json = self._extract_profile_json(agent_reply)
            
            # Clean up the agent reply if we expect JSON at the end, or hide it
            # For displaying to user, we might want to strip the raw JSON block
            agent_reply = re.sub(r'```json\s*\{.*?\}\s*```', '', agent_reply, flags=re.DOTALL).strip()

        return {
            "message": agent_reply or "Извините, я не расслышал, повторите пожалуйста.",
            "is_complete": is_complete,
            "question_index": question_index + (1 if user_message else 0),
            "profile_json": profile_json
        }

    async def _call_yandexgpt(self, messages: list[dict]) -> str:
        # Mock LLM for local testing if API key is not set
        if not self.api_key or self.api_key == "mock":
            await asyncio.sleep(1)
            # Find the number of AI questions asked by counting assistant messages 
            q_count = sum(1 for m in messages if m["role"] == "assistant")
            if q_count >= 18:
                return "Спасибо за ваши ответы! \n```json\n{\"openness\": 0.8, \"energy_type\": \"fast\", \"attachment_style\": \"secure\", \"conflict_style\": \"healthy_boundary\", \"top_values\": [\"свобода\"], \"shadow_patterns\": [], \"refused_questions\": [], \"confidence_score\": 0.9, \"profile_notes\": \"\"}\n```"
            return f"Это заглушка ответа AI (Вопрос {q_count + 1}). Расскажи подробнее?"

        headers = {
            "Authorization": f"Api-Key {self.api_key}",
            "Content-Type": "application/json",
            "x-folder-id": self.folder_id
        }
        
        # Translate to Yandex API format
        yandex_messages = []
        for m in messages:
            y_role = "system" if m["role"] == "system" else "user" if m["role"] == "user" else "assistant"
            yandex_messages.append({"role": y_role, "text": m["text"]})

        body = {
            "modelUri": f"gpt://{self.folder_id}/yandexgpt-pro",
            "completionOptions": {
                "stream": False,
                "temperature": settings.llm_temperature,
                "maxTokens": settings.llm_max_tokens
            },
            "messages": yandex_messages
        }

        async with self.semaphore:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Retry logic
                for attempt, delay in enumerate([1, 2, 4]):
                    try:
                        resp = await client.post(self.url, headers=headers, json=body)
                        if resp.status_code == 429 and attempt < 2:
                            await asyncio.sleep(delay)
                            continue
                        resp.raise_for_status()
                        data = resp.json()
                        return data.get("result", {}).get("alternatives", [{}])[0].get("message", {}).get("text", "")
                    except Exception as e:
                        logger.error(f"Failed to call YandexGPT: {str(e)}")
                        if attempt == 2:
                            return ""
                return ""

    def _extract_profile_json(self, last_message: str) -> dict | None:
        match = re.search(r'```json\s*(\{.*?\})\s*```', last_message, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                return None
        return None

    async def _save_history(self, session_id: str, history: list[dict], redis):
        redis_key = f"interview:{session_id}"
        await redis.setex(redis_key, 72 * 3600, json.dumps(history, ensure_ascii=False))

ai_agent = AIAgent()
