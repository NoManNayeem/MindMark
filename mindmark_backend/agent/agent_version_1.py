# agent/agent.py

import os
from pathlib import Path
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.memory.v2.memory import Memory
from agno.memory.v2.db.sqlite import SqliteMemoryDb
from agno.storage.sqlite import SqliteStorage


# Project root and memory DB config
BASE_DIR = Path(__file__).resolve().parent.parent
MEMORY_DB_FILE = os.getenv("MEMORY_DB_FILE", BASE_DIR / "memory.sqlite3")

def get_agent(user_id, topic_id):
    """
    Returns a memory-enabled Agent instance scoped to a user + topic.
    Includes long-term memory, session storage, and agentic memory tools.
    """
    session_id = f"user-{user_id}-topic-{topic_id}"
    db_path = str(MEMORY_DB_FILE)

    # Memory database
    memory_db = SqliteMemoryDb(
        table_name="user_memories",
        db_file=db_path,
    )

    # Optional: customize this to use different models if needed
    model = OpenAIChat(id="gpt-4o")

    memory = Memory(
        model=model,
        db=memory_db,
    )

    # Storage for past chat sessions
    storage = SqliteStorage(
        table_name="agent_sessions",
        db_file=db_path,
    )

    agent = Agent(
        model=model,
        memory=memory,
        storage=storage,
        session_id=session_id,
        enable_agentic_memory=True,      # ✅ Agent can update/delete memories
        enable_user_memories=True,       # ✅ Always run memory manager after responses
        add_history_to_messages=True,    # ✅ Include recent messages in context
        num_history_runs=5,              # ✅ Number of past turns to include
        read_chat_history=True,          # ✅ Allow querying entire session history
        markdown=True,                   # ✅ Format markdown output (important for FE)
    )

    return agent
