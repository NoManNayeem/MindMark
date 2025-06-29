# agent/agent.py

import os
from pathlib import Path
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

    # Memory database scoped to user-topic combinations
    memory_db = SqliteMemoryDb(
        table_name="memories_user_topic",
        db_file=db_path,
    )

    # Groq LLM
    model = Groq(id="gemma2-9b-it")

    # Memory instance (❌ no session_id here)
    memory = Memory(
        model=model,
        db=memory_db,
    )

    # Session history storage
    storage = SqliteStorage(
        table_name="sessions_user_topic",
        db_file=db_path,
    )

    # Web search capability using Tavily
    tavily = TavilyTools(
        search=True,
        search_depth="advanced",
        include_answer=True,
        format="markdown",
        max_tokens=6000,
    )

    # Full agent configuration
    agent = Agent(
        model=model,
        memory=memory,
        storage=storage,
        tools=[tavily],
        session_id=session_id,
        enable_agentic_memory=True,      # 🔁 Auto-manage memories
        enable_user_memories=True,       # 🧠 Store insights
        add_history_to_messages=True,    # 📝 Use chat history
        num_history_runs=5,
        read_chat_history=True,
        markdown=True,
    )

    return agent
