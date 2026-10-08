"""Versioned native-client contract; plans always use the canonical server engine."""
from flask import Blueprint, jsonify
from .auth import resolve_identity
from .account import load_state
from .db import get_db
from .workouts import make_plan

native_bp = Blueprint('native', __name__)

@native_bp.get('/api/native/v1/bootstrap')
def bootstrap():
    user = resolve_identity()
    if not user:
        return jsonify(error='Entre com sua conta para continuar.', code='SIGN_IN_REQUIRED'), 401
    with get_db() as conn:
        state, revision = load_state(conn, user['id'], user['email'])
    profile = (state or {}).get('profile') or {}
    return jsonify(contractVersion=1, user=user, state=state, revision=revision,
                   plan=make_plan(profile) if profile.get('complete') else [],
                   capabilities={'emailAuth': True, 'googleNativeAuth': False,
                                 'accountRevision': True, 'localDraft': True})
