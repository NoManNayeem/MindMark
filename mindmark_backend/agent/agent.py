# agent/agent.py

import os
from pathlib import Path
from textwrap import dedent

from agno.agent import Agent
from agno.models.groq import Groq
from agno.memory.v2.memory import Memory
from agno.memory.v2.db.sqlite import SqliteMemoryDb
from agno.storage.sqlite import SqliteStorage
from agno.tools.tavily import TavilyTools

# Project base directory and SQLite DB path
BASE_DIR = Path(__file__).resolve().parent.parent
MEMORY_DB_FILE = os.getenv("MEMORY_DB_FILE", BASE_DIR / "memory.sqlite3")


def get_agent(user_id, topic_id):
    """
    Returns a memory-enabled research assistant Agent instance scoped to a user+topic.
    Enables persistent memory, web search, and topic-isolated conversation history.
    """
    session_id = f"user-{user_id}-topic-{topic_id}"
    db_path = str(MEMORY_DB_FILE)

    # 🧠 Memory database scoped to user-topic
    memory_db = SqliteMemoryDb(
        table_name="memories_user_topic",
        db_file=db_path,
    )

    # 🤖 Model
    model = Groq(id="gemma2-9b-it")

    # 🧠 Memory
    memory = Memory(
        model=model,
        db=memory_db,
    )

    # 💾 Session storage
    storage = SqliteStorage(
        table_name="sessions_user_topic",
        db_file=db_path,
    )

    # 🔍 Web search tool
    tavily = TavilyTools(
        search=True,
        search_depth="advanced",
        include_answer=True,
        format="markdown",
        max_tokens=6000,
    )

    # ⚙️ Create Agent
    agent = Agent(
        model=model,
        memory=memory,
        storage=storage,
        tools=[tavily],
        session_id=session_id,
        enable_agentic_memory=True,
        enable_user_memories=True,
        add_history_to_messages=True,
        num_history_runs=5,
        read_chat_history=True,
        markdown=True,
        description=dedent("""\
            You are an intelligent and helpful AI research assistant.

            - Answer questions clearly and concisely.
            - Use tools (like web search) only when necessary, and explain why you're using them.
            - When using external tools, summarize and verify the information before presenting it to the user.
            - If the task involves judgment, uncertainty, or requires user decision-making, ask the user for confirmation or input before proceeding.
            - Always keep the user in the loop.
            - If the user has previously mentioned preferences or goals, take them into account when responding.
            - Be polite, proactive, and collaborative.
        """)
    )

    return agent
