"""Apply migrations once in the master before any worker accepts traffic."""
def on_starting(server):
    from backend.migrate import run_migrations
    run_migrations()
