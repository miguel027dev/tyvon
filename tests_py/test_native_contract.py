from contextlib import contextmanager
import app
from backend import native

@contextmanager
def db():
    yield object()

def test_native_rejects_anonymous(monkeypatch):
    monkeypatch.setattr(native, 'resolve_identity', lambda: None)
    assert app.app.test_client().get('/api/native/v1/bootstrap').status_code == 401

def test_native_plan_is_canonical_and_revision_is_preserved(monkeypatch):
    profile = dict(name='Atleta', age=25, goal='Ganhar massa muscular',
                   experience='Intermediário', days=3, sessionMinutes=45,
                   equipment=['Halteres', 'Banco'], limitations='Nenhuma', complete=True)
    monkeypatch.setattr(native, 'resolve_identity', lambda: {'id':'u', 'email':'test@example.com'})
    monkeypatch.setattr(native, 'get_db', db)
    monkeypatch.setattr(native, 'load_state', lambda *args: ({'profile':profile, 'logs':[]}, 7))
    result = app.app.test_client().get('/api/native/v1/bootstrap').get_json()
    assert result['plan'] == native.make_plan(profile)
    assert result['revision'] == 7
    assert result['capabilities']['googleNativeAuth'] is False
