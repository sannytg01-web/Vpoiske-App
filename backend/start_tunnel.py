import asyncio
import re
import sys
import httpx
import logging
import asyncio.subprocess

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("localtunnel")

BOT_TOKEN = "8619760147:AAGC2IRtTbW0d3qZh5rOIbgO9rzi4hKC7Ow"

async def main():
    logger.info("Starting localtunnel process...")
    # Start locatunnel subprocess
    process = await asyncio.create_subprocess_shell(
        "npx -y localtunnel --port 8000",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    
    url = None
    logger.info("Waiting for localtunnel URL...")
    while True:
        line = await process.stdout.readline()
        if not line:
            break
        text = line.decode('utf-8').strip()
        logger.info(f"localtunnel output: {text}")
        if "your url is:" in text:
            url = text.split("your url is: ")[1].strip()
            break
            
    if not url:
        logger.error("Failed to get localtunnel URL.")
        return
        
    logger.info(f"Setting Telegram webhook to: {url}/bot/webhook")
    
    # Set the webhook
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"https://api.telegram.org/bot{BOT_TOKEN}/setWebhook",
            json={"url": f"{url}/bot/webhook"}
        )
        logger.info(f"Telegram setWebhook response: {res.json()}")

    logger.info("Webhook configured! You can now test the bot in Telegram.")
    
    try:
        # Keep alive
        await process.wait()
    except asyncio.CancelledError:
        process.terminate()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
