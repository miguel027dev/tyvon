"""Read-only workout plan for the fully native Android client.

All prescriptions originate in the canonical Python engine, not a second
unreviewed Android algorithm. Personal data comes from the authenticated DB.
"""
from flask import Blueprint, jsonify
from .auth import resolve_identity
from .account import load_state
from .db import get_db
from .workouts import make_plan

native_bp = Blueprint("native", __name__)

@native_bp.get("/api/native/plan")
def native_plan():
    user = resolve_identity()
    if not user:
        return jsonify({"code":"SIGN_IN_REQUIRED","error":"Entre com sua conta para continuar."}),401
    with get_db() as conn:
        state, revision = load_state(conn,user["id"],user["email"])
    if not state or not state["profile"].get("complete"):
        return jsonify({"code":"PROFILE_REQUIRED","error":"Personalize seu perfil antes de treinar."}),409
    return jsonify({"workouts":make_plan(state["profile"]),"revision":revision})
