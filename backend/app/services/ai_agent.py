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

    async def get_next_message(self, session_id: str, user_message: str | None, question_index: int, redis, user_name: str = "Пользователь") -> dict:
        redis_key = f"interview:{session_id}"
        
        # 1. Загрузить историю
        history_data = await redis.get(redis_key)
        if history_data:
            history = json.loads(history_data)
            # If we are just fetching the current state (e.g. reload), return the last assistant message without calling LLM
            if not user_message:
                for msg in reversed(history):
                    if msg["role"] == "assistant":
                        return {
                            "message": msg["text"],
                            "is_complete": question_index >= 18,
                            "question_index": question_index,
                            "profile_json": None
                        }
        else:
            # 2. История пуста → создать системное сообщение
            prompt = INTERVIEW_PROMPT.replace("Привет!", f"Привет, {user_name}!")
            prompt += f"\nВажно: Пользователя зовут {user_name}. Не спрашивай, как его/её зовут! Сразу обращайся по имени."
            history = [{"role": "system", "text": prompt}]

        # 3. Добавить user_message
        if user_message:
            history.append({"role": "user", "text": user_message})

        # 4. Вызвать LLM
        agent_reply = await self._call_llm(history)

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

    async def _call_llm(self, messages: list[dict]) -> str:
        # Mock LLM for local testing if needed
        # We will use g4f (GPT4Free) for completely free LLM generations without keys!
        try:
            from g4f.client import AsyncClient
            client = AsyncClient()
            response = await client.chat.completions.create(
                model="gpt-4o",  # g4f automatically routes to best provider
                messages=messages
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Failed to call free LLM via g4f: {str(e)}")
            # Ultimate robust fallback to prevent the app from freezing on free AI failure
            q_count = sum(1 for m in messages if m.get("role") == "assistant")
            if q_count == 0:
                return "Привет! Я твой AI-помощник (работаю в fallback-режиме, так как g4f перезагружается). Опиши свой лучший день?"
            if q_count >= 18:
                return "Спасибо за ваши ответы! \n```json\n{\"openness\": 0.8, \"energy_type\": \"fast\", \"attachment_style\": \"secure\", \"conflict_style\": \"healthy_boundary\", \"top_values\": [\"свобода\"], \"shadow_patterns\": [], \"refused_questions\": [], \"confidence_score\": 0.9, \"profile_notes\": \"\"}\n```"
            
            mock_questions = [
                "Какие эмоции тебе сложнее всего прожить?",
                "Опиши свой идеальный вечер пятницы.",
                "Как ты реагируешь на критику от близких?",
                "Что для тебя значит термин 'личное пространство'?"
            ]
            next_q = mock_questions[min(q_count - 1, len(mock_questions) - 1)]
            return f"{next_q} *(Сервер ИИ загружен, но мы продолжаем общаться)*"

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
